var VERTEX_SHADER_SOURCE_DO_NOTHING = `
    precision highp float;

    attribute vec2 a_position;

    varying vec2 v_position;

    void main(void) {
        v_position = a_position;
        gl_Position = vec4(a_position, 0, 1);
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
    precision highp float;

    uniform sampler2D u_randomComplexNumbers;
    
    uniform float u_windX;
    uniform float u_windY;
    uniform float u_transformSize;
    uniform float u_areaSize;
    uniform float u_phillipsConst;
    uniform float u_smallWavesSuppress;

    float PI = ` + Math.PI + `;
    float g  = 9.81;

    float square(float a){
        return a * a;
    }

    void main(void) {
        vec2 index_xy = gl_FragCoord.xy;                   //[0, u_transformSize)
        vec2 nm       = index_xy - u_transformSize * 0.5;  //[-u_transformSize/2, u_transformSize/2)
        vec2 k        = 2.0 * nm * PI / u_areaSize;
        float klen    = length(k);

        vec2 windVector = vec2(u_windX, u_windY);
        float V = length(windVector);
        float L = V * V / g;

        //Phillips spectrum
        float Ph = u_phillipsConst
                 * exp((-1.0 / square(klen * L))) / square(klen * klen) 
                 * square(dot(normalize(k), normalize(windVector)))      //direction factor
                 * exp(-square(klen * u_areaSize / u_smallWavesSuppress)); //remove small waves
        float sqrtPh = sqrt(Ph * 0.5);

        vec2 randomComplexNumber = texture2D(u_randomComplexNumbers, gl_FragCoord.xy / u_transformSize).xy;
        vec2 h0 = randomComplexNumber * sqrtPh;

        gl_FragColor = vec4(h0, k);
    }`


var FRAGMENT_SHADER_SOURCE_HEIGHT_AFTER_T_IN_FREQUENCTY = `
    precision highp float;

    uniform sampler2D u_h0_k;
    uniform float     u_transformSize; 
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
    precision highp float;
    
    const float nSnell = 1.33;

    attribute vec2 a_position; //[-1, 1]   

    varying vec3 v_color;

    uniform sampler2D u_height;
    uniform sampler2D u_displacement;
    uniform sampler2D u_slope;
    
    uniform mat4 u_perspectiveMatrix;
    uniform mat4 u_viewMatrix;

    uniform vec3 u_cameraPosition;
    uniform vec3 u_sunPosition;

    uniform float u_displacementConst;
    uniform float u_scaleHorizontal;
    uniform float u_scaleVertical;
    
    vec3 hdr (vec3 color, float exposure) {
        return 1.0 - exp(-color * exposure);
    }

    float calculateFresnel(vec3 normal, vec3 viewDirection) {
        float thetaICos = abs(dot(normal, viewDirection));
        float thetaI    = acos(thetaICos);
        float thetaTSin = sin(thetaI / nSnell);
        float thetaT    = asin(thetaTSin);
        
        float fs = sin(thetaT - thetaI) / sin(thetaT + thetaI);
        float ft = tan(thetaT - thetaI) / tan(thetaT - thetaI);

        return clamp(0.5 * (fs * fs + ft * ft), 0., 1.);
    }

    void main(void) {
        vec2 texPos = a_position * 0.5 + 0.5;

        float height      = texture2D(u_height, texPos).x;
        vec2 displacement = texture2D(u_displacement, texPos).xz;
        vec2 slope        = texture2D(u_slope, texPos).xz; // * 5.;

        vec2 dispPos  = a_position + displacement * u_displacementConst;
        vec3 position = vec3(
            u_scaleHorizontal * dispPos.x,
            u_scaleVertical   * height,
            u_scaleHorizontal * dispPos.y);
        vec3 viewPosition = (u_viewMatrix * vec4(position, 1)).xyz;

        vec3 oceanColor = vec3(0.04, 0.16, 0.47);
        vec3 skyColor = vec3(3.2, 9.6, 12.8) * 0.2;
        vec3 sunColor = vec3(1., 1., 0.);

        
        vec3 normal              = normalize(vec3(-slope.x, 1, -slope.y));
        vec3 viewDirection       = normalize(u_cameraPosition - position);
        vec3 incidentDirection   = normalize(position - u_sunPosition);
        vec3 reflectionDirection = normalize(reflect(incidentDirection, normal));

        float fresnelReflectivity = calculateFresnel(normal, viewDirection) * 0.1;

        vec3 color = fresnelReflectivity * skyColor + (1. - fresnelReflectivity) * oceanColor;

        // vec3 viewNormal = normalize((u_viewMatrix * vec4(normal, 1)).xyz);
        // vec3 viewVector = normalize((u_viewMatrix * vec4(u_cameraPosition, 1)).xyz - viewPosition);
        // vec3 lightVector = normalize((u_viewMatrix * vec4(u_sunPosition, 1)).xyz - viewPosition);
        // vec3 halfVector = normalize(viewVector + lightVector);
        
        
        vec3 viewVector  = normalize(u_cameraPosition - position);
        vec3 lightVector = normalize(u_sunPosition - position);
        vec3 halfVector  = normalize(viewVector + lightVector);
        
        
        float facing = dot(normal, lightVector);
        
        if(facing > 0.){
            float mod = max(pow(dot(normal, halfVector), 80.0), 0.01);
            color += mod;
        }


        // vec3 sky = fresnelReflectivity * skyColor;

        // float diffuse = clamp(dot(normal, normalize(u_sunPosition)), 0.0, 1.0);
        // vec3 water = (1.0 - fresnelReflectivity) * oceanColor * skyColor * diffuse;

        // vec3 color = sky + water;

        color = hdr(color, 0.5);

        v_color = color;
        gl_Position = u_perspectiveMatrix * u_viewMatrix * vec4(position, 1);
    }`


var FRAGMENT_SHADER_SOURCE_OCEAN = `
    precision highp float;

    varying vec3 v_color;

    void main(void) {


        gl_FragColor = vec4(v_color, 1);
    }`


/*
vec3 v = (u_viewMatrix * vec4(position, 1.0)).xyz;
vec3 lightVector = normalize((u_viewMatrix * vec4(u_sunPosition, 1.0)).xyz - v);
// vec3 lightVector = normalize((u_viewMatrix * vec4(u_sunPosition, 1.0)).xyz - v);

        float facing = dot(normal, (u_viewMatrix * vec4(lightVector, 0)).xyz);
        // float facing = dot(normal, lightVector);
        if(facing > 0.) {
            vec3 halfAngleVector = normalize(lightVector + normalize(-v));
            // float mod = max(pow(dot(normal, normalize(u_sunPosition - position)), 3.0), 0.0);
            float mod = max(pow(dot(normal, halfAngleVector), 120.0), 0.01);
            // color += vec3(mod, 0, 0);
            color += mod;
        }
        */
/*


    vec3 pos(vec2 pos){
        vec2 texPos = position2TexturePosition(pos);

        float height         = texture2D(u_height, texPos).x;
        vec2 displacement = texture2D(u_displacement, texPos).xz;

        vec2 dispPos  = pos + displacement * 0.1;
        vec3 position = vec3(dispPos.x, height, dispPos.y);
        return position;
    }


    float delta = 1. / 512.;

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



        vec3 oceanColor = vec3(0.04, 0.16, 0.47) * 2.;
        vec3 skyColor = vec3(3.2, 9.6, 12.8);

        vec2 slope = texture2D(u_slope, texPos).xz; // * 5.;

        vec3 normal = normalize(vec3(-slope.x, 1, -slope.y));

        vec3 view = normalize(u_cameraPosition - position);

        vec3 incident = normalize(-u_sunVector);

        float fresnel = 1.0 - clamp(dot(normal, view), 0., 1.);
        // float fresnel = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);
        vec3 sky = fresnel * skyColor;

        float diffuse = clamp(dot(normal, normalize(u_sunVector)), 0.0, 1.0);
        vec3 water = (1.0 - fresnel) * oceanColor * skyColor * diffuse;

        vec3 color = sky + water;

        color = hdr(color, 0.35);


*/