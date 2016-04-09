var Renderer = function(canvas) {
	var gl = canvas.getContext('experimental-webgl');
    gl.getExtension('OES_texture_float');


    /*****************************************************************/
    /************************SHADER SOURCES***************************/
    /*****************************************************************/
    var vertexShaderSourcePassPosition = VERTEX_SHADER_SOURCE_DO_NOTHING;

    var vertexShaderSourceOcean = 
        '#define DISPLACEMENT_CONST {0}\n'.format(f2s(DISPLACEMENT_CONST)) +
        VERTEX_SHADER_SOURCE_OCEAN;

    var fragmentShaderSourceFFT1Rows = 
        '#define ROWS\n' + 
        FRAGMENT_SHADER_SOURCE_FFT;
    
    var fragmentShaderSourceFFT1Cols = 
        '#define COLS\n' + 
        FRAGMENT_SHADER_SOURCE_FFT;

    var fragmentShaderSourceFFT2Rows = 
        '#define ROWS\n' + 
        '#define DOUBLE\n' + 
        FRAGMENT_SHADER_SOURCE_FFT;

    var fragmentShaderSourceFFT2Cols = 
        '#define COLS\n' + 
        '#define DOUBLE\n' + 
        FRAGMENT_SHADER_SOURCE_FFT;
        
    var fragmentShaderSourceHeightInitInFrequency = 
        '#define PHILLIPS_CONST {0}\n'.format(f2s(PHILLIPS_CONST)) +
        FRAGMENT_SHADER_SOURCE_HEIGHT_INIT_IN_FREQUENCY;
    
    var fragmentShaderSourceheightAfterTInFrequency = FRAGMENT_SHADER_SOURCE_HEIGHT_AFTER_T_IN_FREQUENCTY;

    var fragmentShaderSourceDisplacementAfterTInFrequency = 
        '#define DISPLACEMENT\n' +
        FRAGMENT_SHADER_SOURCE_DISPLACEMENT_SLOPE_AFTER_T_IN_FREQUENCY;
    
    var fragmentShaderSourceSlopeAfterTInFrequency = 
        '#define SLOPE\n' +
        FRAGMENT_SHADER_SOURCE_DISPLACEMENT_SLOPE_AFTER_T_IN_FREQUENCY;

    var fragmentShaderSourceOcean = FRAGMENT_SHADER_SOURCE_OCEAN;


    /*****************************************************************/
    /*************************BUILD SHADERS***************************/
    /*****************************************************************/
    var vertexShaderPassPosition                    = buildVertexShader(gl, vertexShaderSourcePassPosition);
    var vertexShaderOcean                            = buildVertexShader(gl, vertexShaderSourceOcean);
    
    var fragmentShaderHeightInitInFrequency         = buildFragmentShader(gl, fragmentShaderSourceHeightInitInFrequency);
    var fragmentShaderHeightAfterTInFrequency       = buildFragmentShader(gl, fragmentShaderSourceheightAfterTInFrequency);
    var fragmentShaderDisplacementAfterTInFrequency = buildFragmentShader(gl, fragmentShaderSourceDisplacementAfterTInFrequency);
    var fragmentShaderSlopeAfterTInFrequency        = buildFragmentShader(gl, fragmentShaderSourceSlopeAfterTInFrequency);
    var fragmentShaderFFT1Rows                      = buildFragmentShader(gl, fragmentShaderSourceFFT1Rows);
    var fragmentShaderFFT1Cols                      = buildFragmentShader(gl, fragmentShaderSourceFFT1Cols);
    var fragmentShaderFFT2Rows                      = buildFragmentShader(gl, fragmentShaderSourceFFT2Rows);
    var fragmentShaderFFT2Cols                      = buildFragmentShader(gl, fragmentShaderSourceFFT2Cols);
    var fragmentShaderOcean                          = buildFragmentShader(gl, fragmentShaderSourceOcean);


    /*****************************************************************/
    /*************************INIT TEXTURES***************************/
    /*****************************************************************/
    var randomNormalPairs = [];
    for (var i = 0; i < TRANSFORM_SIZE * TRANSFORM_SIZE; i++){
        randomNormalPairs.push(randomNormal());
        randomNormalPairs.push(randomNormal());
        randomNormalPairs.push(0);
        randomNormalPairs.push(0);
    }

    var texturerandomComplexNumbers          = buildDataTexture(gl, UNIT_TEXTURE_RANDOM_COMPLEX_NUMBERS, TRANSFORM_SIZE, TRANSFORM_SIZE, 
                                                                new Float32Array(randomNormalPairs));
    var textureInitHeightInFrequency         = buildDataTexture(gl, UNIT_TEXTURE_INIT_HEIGHT_IN_FREQUENCY, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var textureHeightAfterTInFrequency       = buildDataTexture(gl, UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var textureHeightAfterTInTime            = buildDataTexture(gl, UNIT_TEXTURE_HEIGHT_AFTER_T_IN_TIME, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var textureDisplacementAfterTInFrequency = buildDataTexture(gl, UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_FREQUENCY, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var textureDisplacementAfterTInTime      = buildDataTexture(gl, UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_TIME, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var textureSlopeAfterTInFrequency        = buildDataTexture(gl, UNIT_TEXTURE_SLOPE_AFTER_T_IN_FREQUENCY, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var textureSlopeAfterTInTime             = buildDataTexture(gl, UNIT_TEXTURE_SLOPE_AFTER_T_IN_TIME, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var texturePing                          = buildDataTexture(gl, UNIT_TEXTURE_PING, TRANSFORM_SIZE, TRANSFORM_SIZE, null);
    var texturePong                          = buildDataTexture(gl, UNIT_TEXTURE_PONG, TRANSFORM_SIZE, TRANSFORM_SIZE, null);


    /*****************************************************************/
    /***********************INIT FRAMEBUFFERS*************************/
    /*****************************************************************/
    var framebufferInitHeightInFrequency         = buildFramebuffer(gl, textureInitHeightInFrequency);
    var framebufferHeightAfterTInFrequency       = buildFramebuffer(gl, textureHeightAfterTInFrequency);
    var framebufferHeightAfterTInTime            = buildFramebuffer(gl, textureHeightAfterTInTime);
    var framebufferDisplacementAfterTInFrequency = buildFramebuffer(gl, textureDisplacementAfterTInFrequency);
    var framebufferDisplacementAfterTInTime      = buildFramebuffer(gl, textureDisplacementAfterTInTime);
    var framebufferSlopeAfterTInFrequency        = buildFramebuffer(gl, textureSlopeAfterTInFrequency);
    var framebufferSlopeAfterTInTime             = buildFramebuffer(gl, textureSlopeAfterTInTime);
    var framebufferPing                          = buildFramebuffer(gl, texturePing);
    var framebufferPong                          = buildFramebuffer(gl, texturePong);

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
    gl.uniform2f(programInitHeightInFrequency.uniformLocations['u_windVector'], WIND_X, WIND_Y);
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_transformSize'], TRANSFORM_SIZE);
    gl.uniform1f(programInitHeightInFrequency.uniformLocations['u_areaSize'], AREA_SIZE);

    var programHeightAfterTInFrequency = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderHeightAfterTInFrequency, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programHeightAfterTInFrequency.program);
    gl.uniform1i(programHeightAfterTInFrequency.uniformLocations['u_h0'], UNIT_TEXTURE_INIT_HEIGHT_IN_FREQUENCY);
    gl.uniform1f(programHeightAfterTInFrequency.uniformLocations['u_transformSize'], TRANSFORM_SIZE);
    gl.uniform1f(programHeightAfterTInFrequency.uniformLocations['u_areaSize'], AREA_SIZE);

    var programDisplacementAfterTInFrequency = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderDisplacementAfterTInFrequency, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programDisplacementAfterTInFrequency.program);
    gl.uniform1i(programDisplacementAfterTInFrequency.uniformLocations['u_height_k'], UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY);
    gl.uniform1f(programDisplacementAfterTInFrequency.uniformLocations['u_transformSize'], TRANSFORM_SIZE);

    var programSlopeAfterTInFrequency = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderDisplacementAfterTInFrequency, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programSlopeAfterTInFrequency.program);
    gl.uniform1i(programSlopeAfterTInFrequency.uniformLocations['u_height_k'], UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY);
    gl.uniform1f(programSlopeAfterTInFrequency.uniformLocations['u_transformSize'], TRANSFORM_SIZE);

    var programFFT1Rows = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT1Rows, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT1Rows.program);
    gl.uniform1f(programFFT1Rows.uniformLocations['u_transformSize'], TRANSFORM_SIZE);

    var programFFT1Cols = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT1Cols, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT1Cols.program);
    gl.uniform1f(programFFT1Cols.uniformLocations['u_transformSize'], TRANSFORM_SIZE);

    var programFFT2Rows = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT2Rows, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT2Rows.program);
    gl.uniform1f(programFFT2Rows.uniformLocations['u_transformSize'], TRANSFORM_SIZE);

    var programFFT2Cols = buildProgramData(gl, vertexShaderPassPosition, fragmentShaderFFT2Cols, 
        { 'a_position': INDEX_BUFFER_FULLSCREEN });
    gl.useProgram(programFFT2Cols.program);
    gl.uniform1f(programFFT2Cols.uniformLocations['u_transformSize'], TRANSFORM_SIZE);

    var programOcean = buildProgramData(gl, vertexShaderOcean, fragmentShaderOcean, 
        { 'a_position': INDEX_BUFFER_OCEAN });
    gl.useProgram(programOcean.program);
    gl.uniform1i(programOcean.uniformLocations['u_height'], UNIT_TEXTURE_HEIGHT_AFTER_T_IN_TIME);
    gl.uniform1i(programOcean.uniformLocations['u_displacement'], UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_TIME);
    gl.uniform1i(programOcean.uniformLocations['u_slope'], UNIT_TEXTURE_SLOPE_AFTER_T_IN_TIME);


    /*****************************************************************/
    /**********************INIT VERTEX BUFFERS************************/
    /*****************************************************************/
    var vertexBufferArrayFullscreen = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
    var vertexNumberFullscreen = 4;
    
    var vertexBufferArrayOcean = [];
    var vertexNumberOcean = 3 * (TRANSFORM_SIZE - 1) * (TRANSFORM_SIZE - 1) * 2;

    for(var z = 0; z < TRANSFORM_SIZE - 1; z++){
        var t =  z      / TRANSFORM_SIZE * 2 - 1;
        var b = (z + 1) / TRANSFORM_SIZE * 2 - 1;
        for(var x = 0; x < TRANSFORM_SIZE - 1; x++){
            var l =  x      / TRANSFORM_SIZE * 2 - 1;
            var r = (x + 1) / TRANSFORM_SIZE * 2 - 1;
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

    var vertexBufferFullscreen = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferFullscreen);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferArrayFullscreen), gl.STATIC_DRAW); 
    gl.vertexAttribPointer(INDEX_BUFFER_FULLSCREEN, 2, gl.FLOAT, false, 0, 0);

    var vertexBufferOcean = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferOcean);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferArrayOcean), gl.STATIC_DRAW); 
    gl.vertexAttribPointer(INDEX_BUFFER_OCEAN, 2, gl.FLOAT, false, 0, 0);
  
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
        while(subtransformSize <= TRANSFORM_SIZE){
            gl.useProgram(programFFTRows.program);
            gl.uniform1i(programFFTRows.uniformLocations['u_input'], getCurrentPingPongTextureUnit());
            gl.uniform1f(programFFTRows.uniformLocations['u_subtransformSize'], subtransformSize);

            changeCurrentPingPong();
            gl.bindFramebuffer(gl.FRAMEBUFFER, getCurrentPingPongFramebuffer());
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);

            subtransformSize *= 2;
        }

        subtransformSize = 2;
        while(subtransformSize * 2 <= TRANSFORM_SIZE){
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
    gl.useProgram(programInitHeightInFrequency.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferInitHeightInFrequency);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexNumberFullscreen);


    /*****************************************************************/
    /************************RENDER FUNCTION**************************/
    /*****************************************************************/
    this.renderFrame = function(time, viewMatrix, projectonMatrix){
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, vertexNumberOcean);
    }
}









/*
    var camera = new Camera();
    camera.changeAzimuth(100);
    console.log(camera);
    var viewMatrix = camera.getViewMatrix();
    

    // var viewMatrix = mat4.create();
    var projectonMatrix = mat4.create();
    // var distanceVec = vec3.create();
    // var scaleVec = vec3.create();


    mat4.perspective(projectonMatrix, (60 / 180) * Math.PI, window.innerWidth/window.innerHeight, 0, 10000);

    // vec3.set(distanceVec, 0, 0, -2.5);
    // vec3.set(scaleVec, 0.8, 0.8, 0.8);

    // mat4.scale(viewMatrix, viewMatrix, scaleVec);
    // mat4.translate(viewMatrix, viewMatrix, distanceVec);
    // mat4.rotateX(viewMatrix, viewMatrix, Math.PI/4);
    // mat4.rotateY(viewMatrix, viewMatrix, Math.PI/3);

    // console.log(viewMatrix);*/