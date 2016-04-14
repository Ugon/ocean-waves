var Camera = function (params) {
    this.changeAzimuth = function (deltaAzimuth) {
        var azimuth = params[PARAM_NAME_CAMERA_AZIMUTH];
        azimuth = PARAM_CALC_INV_CAMERA_AZIMUTH(azimuth + deltaAzimuth);
        params[PARAM_NAME_CAMERA_AZIMUTH] = azimuth;
        params.changed[PARAM_NAME_CAMERA_AZIMUTH] = azimuth;
    }

    this.changeElevation = function (deltaElevation) {
        var elevation = params[PARAM_NAME_CAMERA_ELEVATION];
        elevation = PARAM_CALC_INV_CAMERA_ELEVATION(elevation + deltaElevation);
        params[PARAM_NAME_CAMERA_ELEVATION] = elevation;
        params.changed[PARAM_NAME_CAMERA_ELEVATION] = elevation;
    }

    this.changeDistance = function (deltaDistance) {
        var distance = params[PARAM_NAME_CAMERA_DISTANCE];
    	distance = PARAM_CALC_INV_CAMERA_DISTANCE(distance + deltaDistance);
        params[PARAM_NAME_CAMERA_DISTANCE] = distance;
        params.changed[PARAM_NAME_CAMERA_DISTANCE] = distance;
    }
}

var polar2cartesianVec = function(distance, azimuth, elevation){
    x = distance * Math.sin(Math.PI / 2 - elevation) * Math.cos(Math.PI / 2 + azimuth);
    y = distance * Math.cos(Math.PI / 2 - elevation);  
    z = distance * Math.sin(Math.PI / 2 - elevation) * Math.sin(Math.PI / 2 + azimuth);
    
    var cartesian = vec3.create();
    vec3.set(cartesian, x, y, z);
    return cartesian;
}

var polar2viewMat = function(distance, azimuth, elevation){
    var viewMatrix = mat4.create();
    var distanceVec = vec3.create();
    vec3.set(distanceVec, 0, 0, -distance);

    mat4.translate(viewMatrix, viewMatrix, distanceVec)
    mat4.rotateX(viewMatrix, viewMatrix, elevation);
    mat4.rotateY(viewMatrix, viewMatrix, azimuth);
    return viewMatrix;
}