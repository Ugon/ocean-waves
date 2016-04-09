/*****************************************************************/
/**************************VERTEX SHADERS*************************/
/*****************************************************************/
var VERTEX_SHADER_SOURCE_DO_NOTHING = `
    precision highp float;
    
    attribute vec2 a_position;
    
    void main(void) {
        gl_Position = vec4(a_position, 0, 1);
    }`


var VERTEX_SHADER_SOURCE_GRID = `
    // #define DISPLACEMENT_CONST 
    precision highp float;
    
    attribute vec2 a_position; //[-1, 1]

    varying vec3 v_position;

    uniform sampler2D u_height;
    uniform sampler2D u_displacement;
    
    uniform mat4 u_perspectiveMatrix;
    uniform mat4 u_viewMatrix;
    
    vec2 position2TexturePosition(vec2 pos){
        return pos * 0.5 + 0.5;
    }

    void main(void) {
        vec2 texPos = position2TexturePosition(a_position);

        float height         = length(texture2D(u_height, texPos).xy);
        float displacement_x = length(texture2D(u_displacement, texPos).xy);
        float displacement_y = length(texture2D(u_displacement, texPos).zw);
        vec2  displacement   = vec2(displacement_x, displacement_y);

        vec2 dispPos = a_position + displacement * DISPLACEMENT_CONST;
        vec3 position = vec3(dispPos.x, height, dispPos.y);

        v_position = position;
        v_position.z = height;
        gl_Position = u_perspectiveMatrix * u_viewMatrix * vec4(position, 1);
    }`


/*****************************************************************/
/*********************FFT FRAGMENT SHADER*************************/
/*****************************************************************/
var FRAGMENT_SHADER_SOURCE_FFT = `
	// #defind ROWS
	// #defind COLS
	// #defind DOUBLE
	precision highp float;

    uniform sampler2D u_input;
    uniform float u_transformSize;
    uniform float u_subtransformSize;

    float PI = ` + Math.PI + `;

    vec2 complexTryg(float alpha){
        return vec2(cos(alpha), sin(alpha));
    }

    vec2 index2TexturePosition(vec2 ind){
        return ind / u_transformSize;
    }

    void main(void) {
        float index_x = gl_FragCoord.x; //[0, u_transformSize)
        float index_y = gl_FragCoord.y; //[0, u_transformSize)

    #ifdef ROWS
        float base   = floor(index_x / u_subtransformSize) * u_subtransformSize * 0.5;
        float offset = mod(index_x, u_subtransformSize * 0.5);
    #endif

    #ifdef COLS
        float base   = floor(index_y / u_subtransformSize) * u_subtransformSize * 0.5;
        float offset = mod(index_y, u_subtransformSize * 0.5);
    #endif

        float index_0 = base + offset;
        float index_1 = index_0 + u_transformSize * 0.5;

    #ifdef ROWS
        vec2 twiddle       = complexTryg((-2.0) * PI * (index_x / u_subtransformSize));
        vec4 textureValue0 = texture2D(u_input, index2TexturePosition(vec2(index_0, index_y)));
        vec4 textureValue1 = texture2D(u_input, index2TexturePosition(vec2(index_1, index_y)));
    #endif

    #ifdef COLS
        vec2 twiddle       = complexTryg((-2.0) * PI * (index_y / u_subtransformSize));
        vec4 textureValue0 = texture2D(u_input, index2TexturePosition(vec2(index_x, index_0)));
        vec4 textureValue1 = texture2D(u_input, index2TexturePosition(vec2(index_x, index_1)));
    #endif

        vec2 val0_0   = textureValue0.xy;
        vec2 val1_0   = textureValue1.xy;
        vec2 result_0 = vec2(val0_0.x + twiddle.x * val1_0.x - twiddle.y * val1_0.y,
                             val0_0.y + twiddle.y * val1_0.x + twiddle.x * val1_0.y);

    #ifdef DOUBLE
        vec2 val0_1   = textureValue0.zw;
        vec2 val1_1   = textureValue1.zw;
        vec2 result_1 = vec2(val0_1.x + twiddle.x * val1_1.x - twiddle.y * val1_1.y,
                             val0_1.y + twiddle.y * val1_1.x + twiddle.x * val1_1.y);
    #endif

    #ifdef DOUBLE
        gl_FragColor = vec4(result_0, result_1);        
    #else   
        gl_FragColor = vec4(result_0, 0, 1);        
    #endif
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

    vec2 index2TexturePosition(vec2 ind){
        return ind / u_transformSize;
    }

    void main(void) {
        vec2 index_xy = gl_FragCoord.xy;                                          //[0, u_transformSize)
        vec2 nm       = index_xy - vec2(u_transformSize, u_transformSize) * 0.5;  //[-u_transformSize/2, u_transformSize/2)
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

        vec2 randomComplexNumber = texture2D(u_randomComplexNumbers, index2TexturePosition(index_xy)).xy;
        vec2 h0 = randomComplexNumber * sqrtPh;

        gl_FragColor = vec4(h0, 0, 1);
    }`


var FRAGMENT_SHADER_SOURCE_HEIGHT_AFTER_T_IN_FREQUENCTY = `
    precision highp float;

    uniform sampler2D u_h0;
    uniform float     u_transformSize; 
    uniform float     u_areaSize;
    uniform float     u_t;

    float PI = ` + Math.PI + `;
    float g  = 9.81;

    float omega(float klen){
        return sqrt(g * klen);
    }
    
    vec2 index2TexturePosition(vec2 ind){
        return ind / u_transformSize;
    }

    vec2 minusIndex(vec2 ind){
        return vec2(u_transformSize - 1.0, u_transformSize - 1.0) - ind;
    }

    void main(void) {
        vec2 index_xy = gl_FragCoord.xy;                                          //[0, u_transformSize)
        vec2 nm       = index_xy - vec2(u_transformSize, u_transformSize) * 0.5;  //[-u_transformSize/2, u_transformSize/2)
        vec2 k        = 2.0 * nm * PI / u_areaSize;

        vec2 h0k      = texture2D(u_h0, index2TexturePosition(           index_xy )).xy;
        vec2 h0minusk = texture2D(u_h0, index2TexturePosition(minusIndex(index_xy))).xy;
       
        float wt = omega(length(k)) * u_t;
        float coswt = cos(wt);
        float sinwt = sin(wt);

        vec2 hkt;
        hkt.x = h0k.x * coswt - h0k.y * sinwt + h0minusk.x * coswt - h0minusk.y * sinwt;
        hkt.y = h0k.x * sinwt + h0k.y * coswt - h0minusk.x * sinwt + h0minusk.y * coswt;

        gl_FragColor = vec4(hkt, k);
    }`


var FRAGMENT_SHADER_SOURCE_DISPLACEMENT_AFTER_T_IN_FREQUENCY = `
	precision highp float;

    uniform sampler2D u_height_k;
    uniform float     u_transformSize; 

    vec2 index2TexturePosition(vec2 ind){
        return ind / u_transformSize;
    }

    vec2 complexMultI(vec2 complex){
        return vec2(-complex.y, complex.x);
    }

    void main(void) {
        vec2 index_xy = gl_FragCoord.xy; //[0, u_transformSize)

        vec4 height_k = texture2D(u_height_k, index2TexturePosition( index_xy ));
        vec2 hkt      = height_k.xy;
        vec2 k        = height_k.zw;

        vec2 ihkt_x   = -complexMultI(hkt * k.x / length(k));
        vec2 ihkt_y   = -complexMultI(hkt * k.y / length(k));

        gl_FragColor  = vec4(ihkt_x, ihkt_y);
    }`


/*****************************************************************/
/***********************GRID FRAGMENT SHADER**********************/
/*****************************************************************/
var FRAGMENT_SHADER_SOURCE_GRID = `
    precision highp float;

    varying vec3 v_position;

    float position2TexturePosition(float pos){
        return pos * 0.5 + 0.5;
    }

    void main(void) {
        gl_FragColor = vec4(0.9 * (v_position.zzz * 0.5 + 0.5), 1);
    }`