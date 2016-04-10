var VERTEX_SHADER_SOURCE_DO_NOTHING = `
    precision highp float;

    attribute vec2 a_position;

    varying vec2 v_position;

    void main(void) {
        v_position = a_position;
        gl_Position = vec4(a_position, 0, 1);
    }`


var FRAGMENT_SHADER_DISPLAY = `
    precision highp float;

    varying vec2 v_position;
    varying vec2 v_texturePosition;

    uniform sampler2D u_input;

    vec2 position2TexturePosition(vec2 pos){
        return pos * 0.5 + 0.5;
    }

    void main(void) {
        vec2 index_xy = gl_FragCoord.xy;                                          //[0, u_transformSize)
        vec4 val = texture2D(u_input, v_position * 0.5 + 0.5);

        gl_FragColor = vec4(val.xy, 0, 1);
    }`



/*****************************************************************/
/*********************FFT FRAGMENT SHADER*************************/
/*****************************************************************/
var FRAGMENT_SHADER_SOURCE_FFT = `
    // #defind ROWS
    // #defind DOUBLE

    precision highp float;

    float PI = ` + Math.PI + `;

    uniform sampler2D u_input;
    uniform float u_transformSize;
    uniform float u_subtransformSize;

    vec2 complexTryg(float alpha){
        return vec2(cos(alpha), sin(alpha));
    }

    vec2 complexMult(vec2 a, vec2 b) {
        return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
    }

    void main (void) {

    #ifdef ROWS
        float index = gl_FragCoord.x - u_transformSize * 0.5 - 0.5;
    #else
        float index = gl_FragCoord.y - u_transformSize * 0.5 - 0.5;
    #endif

        float base = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5);
        float offset = mod(index, u_subtransformSize * 0.5);

        float x0 = base + offset;
        float x1 = x0 + u_transformSize * 0.5;

        float angle = -2.0 * PI * (index / u_subtransformSize);
        vec2 twiddle = complexTryg(angle);

    #ifdef ROWS
        vec4 val0 = texture2D(u_input, vec2(x0 + 0.5, gl_FragCoord.y) / u_transformSize);
        vec4 val1 = texture2D(u_input, vec2(x1 + 0.5, gl_FragCoord.y) / u_transformSize);
    #else
        vec4 val0 = texture2D(u_input, vec2(gl_FragCoord.x, x0 + 0.5) / u_transformSize);
        vec4 val1 = texture2D(u_input, vec2(gl_FragCoord.x, x1 + 0.5) / u_transformSize);
    #endif

    #ifdef DOUBLE
        vec2 outputA = val0.xy + complexMult(twiddle, val1.xy);
        vec2 outputB = val0.zw + complexMult(twiddle, val1.zw);
    #else
        vec2 outputA = val0.xy + complexMult(twiddle, val1.xy);
        vec2 outputB = texture2D(u_input, gl_FragCoord.xy / u_transformSize).zw;
    #endif

        gl_FragColor = vec4(outputA, outputB);
    }`


/*****************************************************************/
/************COMPUTATION IN FREQUENCY FRAGMENT SHADERS************/
/*****************************************************************/
var FRAGMENT_SHADER_SOURCE_HEIGHT_INIT_IN_FREQUENCY = `
	// #define PHILLIPS_CONST
    precision highp float;

    uniform sampler2D u_randomComplexNumbers;
    uniform vec2      u_windVector;
    uniform float     u_transformSize;
    uniform float     u_areaSize;

    float PI = ` + Math.PI + `;
    float g  = 9.81;

    float square(float a){
        return a * a;
    }

    void main(void) {
        vec2 index_xy = gl_FragCoord.xy;                   //[0, u_transformSize)
        vec2 nm       = index_xy - u_transformSize * 0.5;  //[-u_transformSize/2, u_transformSize/2)
        vec2 k        = 2.0 * nm * PI / u_areaSize;
        float klen = length(k);

        float V = length(u_windVector);
        float L = V * V / g;

        //Phillips spectrum
        float Ph = PHILLIPS_CONST
                 * exp((-1.0 / square(klen * L))) / square(klen * klen) 
                 * square(dot(normalize(k), normalize(u_windVector)))      //direction factor
                 * exp(-square(klen * u_areaSize / 1000.0));               //remove small waves
        float sqrtPh = sqrt(Ph * 0.5);

        vec2 randomComplexNumber = texture2D(u_randomComplexNumbers, gl_FragCoord.xy / u_transformSize).xy;
        vec2 h0 = randomComplexNumber * sqrtPh;

        gl_FragColor = vec4(h0, k);
    }`


var FRAGMENT_SHADER_SOURCE_HEIGHT_AFTER_T_IN_FREQUENCTY = `
    precision highp float;

    uniform sampler2D u_h0_k;
    uniform float     u_transformSize; 
    uniform float     u_areaSize;
    uniform float     u_t;

    float PI = ` + Math.PI + `;
    float g  = 9.81;

    float omega(float klen){
        return sqrt(g * klen);
    }
    
    void main(void) {
        vec4 h0k_k    = texture2D(u_h0_k,  gl_FragCoord.xy / u_transformSize);
        vec2 h0minusk = texture2D(u_h0_k, -gl_FragCoord.xy / u_transformSize).xy;
        vec2 k        = h0k_k.zw;
        vec2 h0k      = h0k_k.xy;
       
        float wt = omega(length(k)) * u_t;
        float coswt = cos(wt);
        float sinwt = sin(wt);

        vec2 hkt;
        hkt.x = h0k.x * coswt - h0k.y * sinwt + h0minusk.x * coswt - h0minusk.y * sinwt;
        hkt.y = h0k.x * sinwt + h0k.y * coswt - h0minusk.x * sinwt + h0minusk.y * coswt;

        gl_FragColor = vec4(hkt, k);
    }`


var FRAGMENT_SHADER_SOURCE_DISPLACEMENT_SLOPE_AFTER_T_IN_FREQUENCY = `
    // #define DISPLACEMENT
    // #define SLOPE
	precision highp float;

    uniform sampler2D u_height_k;
    uniform float     u_transformSize; 

    vec2 complexMultI(vec2 complex){
        return vec2(-complex.y, complex.x);
    }

    void main(void) {
        vec4 height_k = texture2D(u_height_k, gl_FragCoord.xy / u_transformSize);
        vec2 hkt      = height_k.xy;
        vec2 k        = height_k.zw;

    #ifdef DISPLACEMENT
        vec2 k_norm =  normalize(k);
        vec2 ihkt_x = -complexMultI(hkt * k_norm.x);
        vec2 ihkt_y = -complexMultI(hkt * k_norm.y);
    #endif

    #ifdef SLOPE
        vec2 ihkt_x = complexMultI(hkt * k.x);
        vec2 ihkt_y = complexMultI(hkt * k.y);
    #endif

        gl_FragColor  = vec4(ihkt_x, ihkt_y);
    }`


/*****************************************************************/
/**************************OCEAN SHADERS**************************/
/*****************************************************************/
var VERTEX_SHADER_SOURCE_OCEAN = `
    // #define DISPLACEMENT_CONST 
    precision highp float;
    
    attribute vec2 a_position; //[-1, 1]

    varying vec2 v_texturePosition;
    varying vec3 v_vertexPosition;
    varying vec2 v_position;

    uniform sampler2D u_height;
    uniform sampler2D u_displacement;
    
    uniform mat4 u_perspectiveMatrix;
    uniform mat4 u_viewMatrix;
    
    vec2 position2TexturePosition(vec2 pos){
        return pos * 0.5 + 0.5;
    }

    void main(void) {
        vec2 texPos = position2TexturePosition(a_position);
        // vec4 displacementVec = texture2D(u_displacement, texPos);


        float height      = texture2D(u_height, texPos).x;
        vec2 displacement = texture2D(u_displacement, texPos).xz;

        // float displacement_x = length(displacementVec.xy);
        // float displacement_y = length(displacementVec.zw);
        // vec2  displacement   = vec2(displacement_x, displacement_y);

        vec2 dispPos  = a_position + displacement * DISPLACEMENT_CONST;
        vec3 position = vec3(dispPos.x, height, dispPos.y);

        v_texturePosition = texPos;
        v_vertexPosition  = position;
        v_position = a_position;

        gl_Position = u_perspectiveMatrix * u_viewMatrix * vec4(position, 1);      
    }`


var FRAGMENT_SHADER_SOURCE_OCEAN = `
    precision highp float;

    varying vec2 v_texturePosition;
    varying vec3 v_vertexPosition;
    varying vec2 v_position;

    uniform sampler2D u_slope;
    uniform sampler2D u_height;
    uniform sampler2D u_displacement;

    uniform vec3 u_cameraPosition;
    uniform vec3 u_sunVector;

    vec3 hdr (vec3 color, float exposure) {
        return 1.0 - exp(-color * exposure);
    }

    vec2 position2TexturePosition(vec2 pos){
        return pos * 0.5 + 0.5;
    }

    vec3 pos(vec2 pos){
        vec2 texPos = position2TexturePosition(pos);
        // vec4 displacementVec = texture2D(u_displacement, texPos);

        float height         = texture2D(u_height, texPos).x;
        vec2 displacement = texture2D(u_displacement, texPos).xz;

        // float displacement_x = length(displacementVec.xy);
        // float displacement_y = length(displacementVec.zw);
        // vec2  displacement   = vec2(displacement_x, displacement_y);

        vec2 dispPos  = pos + displacement * 0.1;
        vec3 position = vec3(dispPos.x, height, dispPos.y);
        return position;
    }

    void main(void) {
        vec3 oceanColor = vec3(0.04, 0.16, 0.47);
        vec3 skyColor = vec3(3.2, 9.6, 12.8) * 0.05;

        vec4 slopeVec = texture2D(u_slope, v_texturePosition);

        float slope_x = slopeVec.x;
        float slope_y = slopeVec.z;
        vec2  slope   = normalize(vec2(slope_x, slope_y));

        vec3 normal = normalize(vec3(-slope.x, 1, -slope.y));
        // vec3 normal = normalize(vec3(slope_x, 0.2, slope_y));

     /*   float delta = 1. / 512.;

        vec3 center = pos(v_position);
        vec3 top    = pos(v_position + vec2(0     , delta ));
        vec3 bot    = pos(v_position - vec2(0     , delta ));
        vec3 left   = pos(v_position - vec2(delta , 0     ));
        vec3 right  = pos(v_position + vec2(delta , 0     ));

        vec3 topVector = top - center;
        vec3 botVector = bot - center;
        vec3 leftVector = left - center;
        vec3 rightVector = right - center;

        vec3 vectorrt = cross(rightVector, topVector);
        vec3 vectortl = cross(topVector, leftVector);
        vec3 vectorlb = cross(leftVector, botVector);
        vec3 vectorbr = cross(botVector, rightVector); 

        vec3 normal2 = normalize(vectorbr + vectorlb + vectortl + vectorrt);

*/

        vec3 view = normalize(u_cameraPosition - v_vertexPosition);
        float fresnel = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);
        vec3 sky = fresnel * skyColor;

        float diffuse = clamp(dot(normal, normalize(u_sunVector)), 0.0, 1.0);
        vec3 water = (1.0 - fresnel) * oceanColor * skyColor * diffuse;

        vec3 color = sky + water;

        vec4 displacementVec = texture2D(u_displacement, v_texturePosition);
        float displacement_x = length(displacementVec.xy);
        float displacement_y = length(displacementVec.zw);
        vec2  displacement   = normalize(vec2(displacement_x, displacement_y));

        gl_FragColor = vec4(hdr(color, 0.35), 1);
    }`