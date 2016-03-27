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
		uniformLocations[uniformLocation.name] = uniformLocation;
	}

	programData.program = program;
	programData.attribLocations = attribLocations;
	programData.uniformLocations = uniformLocations;
	return programData;
}