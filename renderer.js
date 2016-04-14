var Renderer = function(canvas, params) {
	var gl = canvas.getContext('experimental-webgl');
    gl.getExtension('OES_texture_float');

    var transformSize = params[PARAM_NAME_TRANSFORM_SIZE];

    /*****************************************************************/
    /************************SHADER SOURCES***************************/
    /*****************************************************************/
    var vertexShaderSourcePassPosition = VERTEX_SHADER_SOURCE_DO_NOTHING;
    var vertexShaderSourceOcean        = VERTEX_SHADER_SOURCE_OCEAN;

    var fragmentShaderSourceFFT1Rows = 
        '#define ROWS\n' + FRAGMENT_SHADER_SOURCE_FFT;    
    
    var fragmentShaderSourceFFT1Cols = 
        FRAGMENT_SHADER_SOURCE_FFT;
    
    var fragmentShaderSourceFFT2Rows = 
        '#define ROWS\n#define DOUBLE\n' + FRAGMENT_SHADER_SOURCE_FFT;
    
    var fragmentShaderSourceFFT2Cols = 
        '#define DOUBLE\n' + FRAGMENT_SHADER_SOURCE_FFT;        
    
    var fragmentShaderSourceHeightInitInFrequency = 
        FRAGMENT_SHADER_SOURCE_HEIGHT_INIT_IN_FREQUENCY;
    
    var fragmentShaderSourceheightAfterTInFrequency = 
        FRAGMENT_SHADER_SOURCE_HEIGHT_AFTER_T_IN_FREQUENCTY;
    
    var fragmentShaderSourceDisplacementAfterTInFrequency = 
        '#define DISPLACEMENT\n' + FRAGMENT_SHADER_SOURCE_DISPLACEMENT_SLOPE_AFTER_T_IN_FREQUENCY;
    
    var fragmentShaderSourceSlopeAfterTInFrequency = 
        '#define SLOPE\n' + FRAGMENT_SHADER_SOURCE_DISPLACEMENT_SLOPE_AFTER_T_IN_FREQUENCY;
    
    var fragmentShaderSourceOcean = 
        FRAGMENT_SHADER_SOURCE_OCEAN;

    


    /*****************************************************************/
    /*************************BUILD SHADERS***************************/
    /*****************************************************************/
    var vertexShaderPassPosition                    = buildVertexShader(gl, vertexShaderSourcePassPosition);
    var vertexShaderOcean                           = buildVertexShader(gl, vertexShaderSourceOcean);
    
    var fragmentShaderHeightInitInFrequency         = buildFragmentShader(gl, fragmentShaderSourceHeightInitInFrequency);
    var fragmentShaderHeightAfterTInFrequency       = buildFragmentShader(gl, fragmentShaderSourceheightAfterTInFrequency);
    var fragmentShaderDisplacementAfterTInFrequency = buildFragmentShader(gl, fragmentShaderSourceDisplacementAfterTInFrequency);
    var fragmentShaderSlopeAfterTInFrequency        = buildFragmentShader(gl, fragmentShaderSourceSlopeAfterTInFrequency);
    var fragmentShaderFFT1Rows                      = buildFragmentShader(gl, fragmentShaderSourceFFT1Rows);
    var fragmentShaderFFT1Cols                      = buildFragmentShader(gl, fragmentShaderSourceFFT1Cols);
    var fragmentShaderFFT2Rows                      = buildFragmentShader(gl, fragmentShaderSourceFFT2Rows);
    var fragmentShaderFFT2Cols                      = buildFragmentShader(gl, fragmentShaderSourceFFT2Cols);
    var fragmentShaderOcean                         = buildFragmentShader(gl, fragmentShaderSourceOcean);

    /*****************************************************************/
    /*************************INIT TEXTURES***************************/
    /*****************************************************************/
    var texturerandomComplexNumbers;
    var textureInitHeightInFrequency;
    var textureHeightAfterTInFrequency;
    var textureHeightAfterTInTime;
    var textureDisplacementAfterTInFrequency;
    var textureDisplacementAfterTInTime;
    var textureSlopeAfterTInFrequency;
    var textureSlopeAfterTInTime;
    var texturePing;
    var texturePong;

    var randomNormal = function() {
        var result = 0;
        for(i = 0; i < 6; i++) result += Math.random();
        return (result - 3) / 3
    }
    
    var buildTextures = function() {
        var randomNormalPairs = [];
        for (var i = 0; i < transformSize * transformSize; i++){
            randomNormalPairs.push(randomNormal());
            randomNormalPairs.push(randomNormal());
            randomNormalPairs.push(0);
            randomNormalPairs.push(0);
        }
    
        texturerandomComplexNumbers          = buildDataTexture(gl, UNIT_TEXTURE_RANDOM_COMPLEX_NUMBERS, transformSize, transformSize, 
                                                                    new Float32Array(randomNormalPairs));
        textureInitHeightInFrequency         = buildDataTexture(gl, UNIT_TEXTURE_INIT_HEIGHT_IN_FREQUENCY, transformSize, transformSize, null);
        textureHeightAfterTInFrequency       = buildDataTexture(gl, UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY, transformSize, transformSize, null);
        textureHeightAfterTInTime            = buildDataTexture(gl, UNIT_TEXTURE_HEIGHT_AFTER_T_IN_TIME, transformSize, transformSize, null);
        textureDisplacementAfterTInFrequency = buildDataTexture(gl, UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_FREQUENCY, transformSize, transformSize, null);
        textureDisplacementAfterTInTime      = buildDataTexture(gl, UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_TIME, transformSize, transformSize, null);
        textureSlopeAfterTInFrequency        = buildDataTexture(gl, UNIT_TEXTURE_SLOPE_AFTER_T_IN_FREQUENCY, transformSize, transformSize, null);
        textureSlopeAfterTInTime             = buildDataTexture(gl, UNIT_TEXTURE_SLOPE_AFTER_T_IN_TIME, transformSize, transformSize, null);
        texturePing                          = buildDataTexture(gl, UNIT_TEXTURE_PING, transformSize, transformSize, null);
        texturePong                          = buildDataTexture(gl, UNIT_TEXTURE_PONG, transformSize, transformSize, null);
    }

    buildTextures();


    /*****************************************************************/
    /***********************INIT FRAMEBUFFERS*************************/
    /*****************************************************************/
    var framebufferInitHeightInFrequency;
    var framebufferHeightAfterTInFrequency;
    var framebufferHeightAfterTInTime;
    var framebufferDisplacementAfterTInFrequency;
    var framebufferDisplacementAfterTInTime;
    var framebufferSlopeAfterTInFrequency;
    var framebufferSlopeAfterTInTime;
    var framebufferPing;
    var framebufferPong;

    var buildFramebuffers = function() {
        framebufferInitHeightInFrequency         = buildFramebuffer(gl, textureInitHeightInFrequency);
        framebufferHeightAfterTInFrequency       = buildFramebuffer(gl, textureHeightAfterTInFrequency);
        framebufferHeightAfterTInTime            = buildFramebuffer(gl, textureHeightAfterTInTime);
        framebufferDisplacementAfterTInFrequency = buildFramebuffer(gl, textureDisplacementAfterTInFrequency);
        framebufferDisplacementAfterTInTime      = buildFramebuffer(gl, textureDisplacementAfterTInTime);
        framebufferSlopeAfterTInFrequency        = buildFramebuffer(gl, textureSlopeAfterTInFrequency);
        framebufferSlopeAfterTInTime             = buildFramebuffer(gl, textureSlopeAfterTInTime);
        framebufferPing                          = buildFramebuffer(gl, texturePing);
        framebufferPong                          = buildFramebuffer(gl, texturePong);
    }

    buildFramebuffers();

    var isPingCurrent                 = true;
    var changeCurrentPingPong         = function() { isPingCurrent = !isPingCurrent; }
    var getCurrentPingPongTexture     = function() { return isPingCurrent ? pingTexture       : pongTexture; }
    var getCurrentPingPongFramebuffer = function() { return isPingCurrent ? framebufferPing   : framebufferPong; }
    var getCurrentPingPongTextureUnit = function() { return isPingCurrent ? UNIT_TEXTURE_PING : UNIT_TEXTURE_PONG; }


    /*****************************************************************/
    /***********************BUILD PROGRAMS****************************/
    /*****************************************************************/
    var programInitHeightInFrequency = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderHeightInitInFrequency, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programInitHeightInFrequency.program);
    gl.uniform1i(programInitHeightInFrequency.uniformLocations['u_randomComplexNumbers'], UNIT_TEXTURE_RANDOM_COMPLEX_NUMBERS);
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_transformSize'], transformSize);
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_phillipsConst'], PARAM_CALC_PHILLIPS_CONST(params[PARAM_NAME_PHILLIPS_CONST]));
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_smallWavesSuppress'], PARAM_CALC_SMALL_WAVE_SUPPRESS(params[PARAM_NAME_SMALL_WAVE_SUPPRESS]));
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_windX'], PARAM_CALC_WIND_X(params[PARAM_NAME_WIND_X]));
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_windY'], PARAM_CALC_WIND_Y(params[PARAM_NAME_WIND_Y]));
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_areaSize'], PARAM_CALC_SIZE_CALC(params[PARAM_NAME_SIZE_CALC]));

    var programHeightAfterTInFrequency = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderHeightAfterTInFrequency, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programHeightAfterTInFrequency.program);
    gl.uniform1i(programHeightAfterTInFrequency.uniformLocations['u_h0_k'], UNIT_TEXTURE_INIT_HEIGHT_IN_FREQUENCY);
    gl.uniform1f(programHeightAfterTInFrequency.uniformLocations['u_transformSize'], transformSize);

    var programDisplacementAfterTInFrequency = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderDisplacementAfterTInFrequency, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programDisplacementAfterTInFrequency.program);
    gl.uniform1i(programDisplacementAfterTInFrequency.uniformLocations['u_height_k'], UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY);
    gl.uniform1f(programDisplacementAfterTInFrequency.uniformLocations['u_transformSize'], transformSize);

    var programSlopeAfterTInFrequency = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderSlopeAfterTInFrequency, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programSlopeAfterTInFrequency.program);
    gl.uniform1i(programSlopeAfterTInFrequency.uniformLocations['u_height_k'], UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY);
    gl.uniform1f(programSlopeAfterTInFrequency.uniformLocations['u_transformSize'], transformSize);

    var programFFT1Rows = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT1Rows, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT1Rows.program);
    gl.uniform1f(programFFT1Rows.uniformLocations['u_transformSize'], transformSize);

    var programFFT1Cols = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT1Cols, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT1Cols.program);
    gl.uniform1f(programFFT1Cols.uniformLocations['u_transformSize'], transformSize);

    var programFFT2Rows = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT2Rows, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT2Rows.program);
    gl.uniform1f(programFFT2Rows.uniformLocations['u_transformSize'], transformSize);

    var programFFT2Cols = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT2Cols, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT2Cols.program);
    gl.uniform1f(programFFT2Cols.uniformLocations['u_transformSize'], transformSize);

    var programOcean = buildProgramData(gl, vertexShaderOcean, fragmentShaderOcean, 
        { 'a_position': INDEX_BUFFER_OCEAN });
    gl.useProgram(programOcean.program);
    gl.uniform1f(programOcean.uniformLocations['u_transformSize'], transformSize);
    gl.uniform1i(programOcean.uniformLocations['u_height'],        UNIT_TEXTURE_HEIGHT_AFTER_T_IN_TIME);
    gl.uniform1i(programOcean.uniformLocations['u_displacement'],  UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_TIME);
    gl.uniform1i(programOcean.uniformLocations['u_slope'],         UNIT_TEXTURE_SLOPE_AFTER_T_IN_TIME);

    gl.uniform1f(programOcean.uniformLocations['u_displacementConst'], PARAM_CALC_DISPLACEMENT_CONST(params[PARAM_NAME_DISPLACEMENT_CONST]));
    gl.uniform1f(programOcean.uniformLocations['u_scaleHorizontal'],   PARAM_CALC_SCALE_HORIZONTAL(  params[PARAM_NAME_SCALE_HORIZONTAL]));
    gl.uniform1f(programOcean.uniformLocations['u_scaleVertical'],     PARAM_CALC_SCALE_VERTICAL(    params[PARAM_NAME_SCALE_VERTICAL]));

    gl.uniform3fv(programOcean.uniformLocations['u_skyColor'],   PARAM_CALC_COLOR_SKY(  params[PARAM_NAME_COLOR_SKY]));
    gl.uniform3fv(programOcean.uniformLocations['u_oceanColor'], PARAM_CALC_COLOR_OCEAN(params[PARAM_NAME_COLOR_OCEAN]));
    gl.uniform3fv(programOcean.uniformLocations['u_sunColor'],   PARAM_CALC_COLOR_SUN(  params[PARAM_NAME_COLOR_SUN]));

    gl.uniform1f(programOcean.uniformLocations['u_normalRatio'],     PARAM_CALC_NORMAL_RATIO(     params[PARAM_NAME_NORMAL_RATIO]));
    gl.uniform1f(programOcean.uniformLocations['u_fresnelBiasExp'],  PARAM_CALC_FRESNEL_BIAS_EXP( params[PARAM_NAME_FRESNEL_BIAS_EXP]));
    gl.uniform1f(programOcean.uniformLocations['u_fresnelBiasLin'],  PARAM_CALC_FRESNEL_BIAS_LIN( params[PARAM_NAME_FRESNEL_BIAS_LIN]));
    gl.uniform1f(programOcean.uniformLocations['u_specularBiasExp'], PARAM_CALC_SEPCULAR_BIAS_EXP(params[PARAM_NAME_SEPCULAR_BIAS_EXP]));
    gl.uniform1f(programOcean.uniformLocations['u_specularBiasLin'], PARAM_CALC_SEPCULAR_BIAS_LIN(params[PARAM_NAME_SEPCULAR_BIAS_LIN]));
    gl.uniform1f(programOcean.uniformLocations['u_diffuseBiasExp'],  PARAM_CALC_DIFFUSE_BIAS_EXP( params[PARAM_NAME_DIFFUSE_BIAS_EXP]));
    gl.uniform1f(programOcean.uniformLocations['u_diffuseBiasLin'],  PARAM_CALC_DIFFUSE_BIAS_LIN( params[PARAM_NAME_DIFFUSE_BIAS_LIN]));

    /*****************************************************************/
    /**********************INIT VERTEX BUFFERS************************/
    /*****************************************************************/
    var vertexBufferArrayFullscreen = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
    var vertexNumberFullscreen = 4;
    
    var vertexBufferFullscreen = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferFullscreen);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferArrayFullscreen), gl.STATIC_DRAW); 
    gl.vertexAttribPointer(INDEX_BUFFER_FULLSCREEN, 2, gl.FLOAT, false, 0, 0);

    var vertexBufferArrayOcean;
    var vertexNumberOcean;

    var buildVertexOceanBuffer = function(tilesHorizontal, tilesVertical){
        vertexBufferArrayOcean = [];
        vertexNumberOcean = 3 * (transformSize) * (transformSize) * 2
                          * ((tilesHorizontal - 1) * 2 + 1)
                          * ((tilesVertical   - 1) * 2 + 1);
    
        for(var tv = 1 - tilesVertical; tv < tilesVertical; tv++){
            for(var z = 0; z < transformSize; z++){
                var t =  z      / transformSize * 2 - 1 + tv * 2;
                var b = (z + 1) / transformSize * 2 - 1 + tv * 2;
                for(var th = 1 - tilesHorizontal; th < tilesHorizontal; th++){
                    for(var x = 0; x < transformSize; x++){
                        var l =  x      / transformSize * 2 - 1 + th * 2;
                        var r = (x + 1) / transformSize * 2 - 1 + th * 2;
                        vertexBufferArrayOcean.push(l);
                        vertexBufferArrayOcean.push(t);
                        vertexBufferArrayOcean.push(l);
                        vertexBufferArrayOcean.push(b);
                        vertexBufferArrayOcean.push(r);
                        vertexBufferArrayOcean.push(b);
            
                        vertexBufferArrayOcean.push(r);
                        vertexBufferArrayOcean.push(b);
                        vertexBufferArrayOcean.push(r);
                        vertexBufferArrayOcean.push(t);
                        vertexBufferArrayOcean.push(l);
                        vertexBufferArrayOcean.push(t);
                    }
                }
            }
        }

        var vertexBufferOcean = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferOcean);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferArrayOcean), gl.STATIC_DRAW); 
        gl.vertexAttribPointer(INDEX_BUFFER_OCEAN, 2, gl.FLOAT, false, 0, 0);
    }

    buildVertexOceanBuffer(params[PARAM_NAME_NO_TILES_HORIZONTAL], params[PARAM_NAME_NO_TILES_VERTICAL]);
     
    gl.enableVertexAttribArray(INDEX_BUFFER_FULLSCREEN);
    gl.enableVertexAttribArray(INDEX_BUFFER_OCEAN);


    /*****************************************************************/
    /*******************FFT MAIN LOOP FUNCTION************************/
    /*****************************************************************/
    var runFFT = function(programFFTRows, programFFTCols, inputTextureUnit, outputFramebuffer){
        gl.useProgram(programFFTRows.program);
        gl.uniform1i(programFFTRows.uniformLocations['u_input'], inputTextureUnit);
        gl.uniform1f(programFFTRows.uniformLocations['u_subtransformSize'], 2);
        gl.bindFramebuffer(gl.FRAMEBUFFER, getCurrentPingPongFramebuffer());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);

        var subtransformSize = 4;
        while(subtransformSize <= transformSize){        
            gl.useProgram(programFFTRows.program);
            gl.uniform1i(programFFTRows.uniformLocations['u_input'], getCurrentPingPongTextureUnit());
            gl.uniform1f(programFFTRows.uniformLocations['u_subtransformSize'], subtransformSize);

            changeCurrentPingPong();
            gl.bindFramebuffer(gl.FRAMEBUFFER, getCurrentPingPongFramebuffer());
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);

            subtransformSize *= 2;
        }

        subtransformSize = 2;
        while(subtransformSize * 2 <= transformSize){
            gl.useProgram(programFFTCols.program);
            gl.uniform1i(programFFTCols.uniformLocations['u_input'], getCurrentPingPongTextureUnit());
            gl.uniform1f(programFFTCols.uniformLocations['u_subtransformSize'], subtransformSize);

            changeCurrentPingPong();
            gl.bindFramebuffer(gl.FRAMEBUFFER, getCurrentPingPongFramebuffer());
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);

            subtransformSize *= 2;
        }


        gl.useProgram(programFFTCols.program);
        gl.uniform1i(programFFTCols.uniformLocations['u_input'], getCurrentPingPongTextureUnit());
        gl.uniform1f(programFFTCols.uniformLocations['u_subtransformSize'], subtransformSize);
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFramebuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);
    }


    /*****************************************************************/
    /****************RENDER INIT HEIGHT IN FREQUENCY******************/
    /*****************************************************************/
    var initHeightInFrequency = function() {
        gl.useProgram(programInitHeightInFrequency.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferInitHeightInFrequency);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);
    }

    initHeightInFrequency();


    /*****************************************************************/
    /********************APPLY CHANGES FUNCTION***********************/
    /*****************************************************************/
    var applyParamChanges = function(paramChanges){
        for(var name in paramChanges){
            var value = paramChanges[name];
            switch(name) {
                case PARAM_NAME_TRANSFORM_SIZE:
                    transformSize = value;
                    buildTextures();
                    buildFramebuffers();
                    buildVertexOceanBuffer(params[PARAM_NAME_NO_TILES_HORIZONTAL], params[PARAM_NAME_NO_TILES_VERTICAL]);

                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_transformSize'], transformSize);
       
                    gl.useProgram(programInitHeightInFrequency.program);
                    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_transformSize'], value);
                    
                    gl.useProgram(programHeightAfterTInFrequency.program);
                    gl.uniform1f(programHeightAfterTInFrequency.uniformLocations['u_transformSize'], value);
                
                    gl.useProgram(programDisplacementAfterTInFrequency.program);
                    gl.uniform1f(programDisplacementAfterTInFrequency.uniformLocations['u_transformSize'], value);
                
                    gl.useProgram(programSlopeAfterTInFrequency.program);
                    gl.uniform1f(programSlopeAfterTInFrequency.uniformLocations['u_transformSize'], value);
                
                    gl.useProgram(programFFT1Rows.program);
                    gl.uniform1f(programFFT1Rows.uniformLocations['u_transformSize'], value);
                
                    gl.useProgram(programFFT1Cols.program);
                    gl.uniform1f(programFFT1Cols.uniformLocations['u_transformSize'], value);
                
                    gl.useProgram(programFFT2Rows.program);
                    gl.uniform1f(programFFT2Rows.uniformLocations['u_transformSize'], value);
                
                    gl.useProgram(programFFT2Cols.program);
                    gl.uniform1f(programFFT2Cols.uniformLocations['u_transformSize'], value);

                    initHeightInFrequency();
                    break;

                case PARAM_NAME_NO_TILES_HORIZONTAL:
                case PARAM_NAME_NO_TILES_VERTICAL:
                    buildVertexOceanBuffer(params[PARAM_NAME_NO_TILES_HORIZONTAL], params[PARAM_NAME_NO_TILES_VERTICAL]);
                    break;

                case PARAM_NAME_PHILLIPS_CONST:
                    gl.useProgram(programInitHeightInFrequency.program);
                    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_phillipsConst'], PARAM_CALC_PHILLIPS_CONST(value));
                    initHeightInFrequency();
                    break;
                
                case PARAM_NAME_SMALL_WAVE_SUPPRESS:
                    gl.useProgram(programInitHeightInFrequency.program);
                    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_smallWavesSuppress'], PARAM_CALC_SMALL_WAVE_SUPPRESS(value));
                    initHeightInFrequency();
                    break;

                case PARAM_NAME_DISPLACEMENT_CONST:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_displacementConst'], PARAM_CALC_DISPLACEMENT_CONST(value));
                    break;              
                
                case PARAM_NAME_WIND_X:
                    gl.useProgram(programInitHeightInFrequency.program);
                    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_windX'], PARAM_CALC_WIND_X(value));
                    initHeightInFrequency();
                    break;
                
                case PARAM_NAME_WIND_Y:
                    gl.useProgram(programInitHeightInFrequency.program);
                    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_windY'], PARAM_CALC_WIND_Y(value));
                    initHeightInFrequency();
                    break;
                
                case PARAM_NAME_SIZE_CALC:
                    gl.useProgram(programInitHeightInFrequency.program);
                    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_areaSize'], PARAM_CALC_SIZE_CALC(value));
                    initHeightInFrequency();
                    break;
                
                case PARAM_NAME_SCALE_HORIZONTAL:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_scaleHorizontal'], PARAM_CALC_SCALE_HORIZONTAL(value));
                    break;

                case PARAM_NAME_SCALE_VERTICAL:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_scaleVertical'], PARAM_CALC_SCALE_VERTICAL(value));
                    break;
                
                case PARAM_NAME_COLOR_SKY:
                    gl.useProgram(programOcean.program);
                    gl.uniform3fv(programOcean.uniformLocations['u_skyColor'], PARAM_CALC_COLOR_SKY(value));
                    break;
            
                case PARAM_NAME_COLOR_OCEAN:
                    gl.useProgram(programOcean.program);
                    gl.uniform3fv(programOcean.uniformLocations['u_oceanColor'], PARAM_CALC_COLOR_OCEAN(value));
                    break;   
               
                case PARAM_NAME_COLOR_SUN:
                    gl.useProgram(programOcean.program);
                    gl.uniform3fv(programOcean.uniformLocations['u_sunColor'], PARAM_CALC_COLOR_SUN(value));
                    break;

                case PARAM_NAME_NORMAL_RATIO:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_normalRatio'], PARAM_CALC_NORMAL_RATIO(value));
                    break;

                case PARAM_NAME_FRESNEL_BIAS_EXP:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_fresnelBiasExp'], PARAM_CALC_FRESNEL_BIAS_EXP(value));
                    break;

                case PARAM_NAME_FRESNEL_BIAS_LIN:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_fresnelBiasLin'], PARAM_CALC_FRESNEL_BIAS_LIN(value));
                    break;

                case PARAM_NAME_SEPCULAR_BIAS_EXP:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_specularBiasExp'], PARAM_CALC_SEPCULAR_BIAS_EXP(value));
                    break;

                case PARAM_NAME_SEPCULAR_BIAS_LIN:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_specularBiasLin'], PARAM_CALC_SEPCULAR_BIAS_LIN(value));
                    break;

                case PARAM_NAME_DIFFUSE_BIAS_EXP:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_diffuseBiasExp'], PARAM_CALC_DIFFUSE_BIAS_EXP(value));
                    break;

                case PARAM_NAME_DIFFUSE_BIAS_LIN:
                    gl.useProgram(programOcean.program);
                    gl.uniform1f(programOcean.uniformLocations['u_diffuseBiasLin'], PARAM_CALC_DIFFUSE_BIAS_LIN(value));
                    break;

                case PARAM_NAME_SUN_X:
                    console.log(PARAM_CALC_SUN_X(value));
                    break;
                
                case PARAM_NAME_SUN_Y:
                    console.log(PARAM_CALC_SUN_Y(value));
                    break;
                
                case PARAM_NAME_SUN_Z:
                    console.log(PARAM_CALC_SUN_Z(value));
                    break;
                         
            }
        }
    }






    /*****************************************************************/
    /************************RENDER FUNCTION**************************/
    /*****************************************************************/
    this.renderFrame = function(time, viewMatrix, projectonMatrix, cameraPosition, paramChanges){
        applyParamChanges(paramChanges);
        
        gl.useProgram(programHeightAfterTInFrequency.program);
        gl.uniform1f(programHeightAfterTInFrequency.uniformLocations['u_t'], time);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferHeightAfterTInFrequency);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);

        gl.useProgram(programDisplacementAfterTInFrequency.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferDisplacementAfterTInFrequency);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);

        gl.useProgram(programSlopeAfterTInFrequency.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferSlopeAfterTInFrequency);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);

        runFFT(programFFT1Rows, programFFT1Cols, UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY, framebufferHeightAfterTInTime);
        runFFT(programFFT2Rows, programFFT2Cols, UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_FREQUENCY, framebufferDisplacementAfterTInTime);
        runFFT(programFFT2Rows, programFFT2Cols, UNIT_TEXTURE_SLOPE_AFTER_T_IN_FREQUENCY, framebufferSlopeAfterTInTime);

        gl.useProgram(programOcean.program);
        gl.uniformMatrix4fv(programOcean.uniformLocations['u_viewMatrix'], false, viewMatrix);
        gl.uniformMatrix4fv(programOcean.uniformLocations['u_perspectiveMatrix'], false, projectonMatrix);

        
        gl.uniform3fv(programOcean.uniformLocations['u_cameraPosition'], cameraPosition);
        gl.uniform3f(programOcean.uniformLocations['u_sunPosition'], 0, 20, -100);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, vertexNumberOcean);
    }
}