var buildShader = function(gl, type, source){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader
}

var buildVertexShader = function(gl, source){
	return buildShader(gl, gl.VERTEX_SHADER, source)
}

var buildFragmentShader = function(gl, source){
	return buildShader(gl, gl.FRAGMENT_SHADER, source)
}

var buildProgram = function(gl, vertexShader, fragmentShader){
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	return program;
}

var buildProgramData = function(gl, vertexShader, fragmentShader, attribLocations){
	var programData = {};

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	for(var attribName in attribLocations){
		gl.bindAttribLocation(program, attribLocations[attribName], attribName);
	}

	gl.linkProgram(program);

	var uniformLocations = {}
	var numOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (var i = 0; i < numOfUniforms; i++) {
		var activeUniform = gl.getActiveUniform(program, i);
		var uniformLocation = gl.getUniformLocation(program, activeUniform.name);
		uniformLocations[activeUniform.name] = uniformLocation;
	}

	programData.program = program;
	programData.attribLocations = attribLocations;
	programData.uniformLocations = uniformLocations;
	return programData;
}

var buildTexture = function(gl, unit, target, level, internalformat, width, height, border, format, type, pixels, texture_wrap_s, texture_wrap_t, texture_min_filter, texture_max_filter){
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(target, 0, gl.RGBA, WIDTH, HEIGHT, 0, gl.RGBA, gl.FLOAT, pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texture_wrap_s);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texture_wrap_t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture_min_filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture_max_filter);
    return texture;
}

var buildDataTexture = function(gl, unit, width, height, pixels){
	return buildTexture(gl, unit, gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, pixels, gl.REPEAT, gl.REPEAT, gl.NEAREST, gl.NEAREST);
}