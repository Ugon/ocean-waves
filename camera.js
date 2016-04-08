var Camera = function () {
    var azimuth = INIT_AZIMUTH;
    var elevation = INIT_ELEVATION;
    var distance = INIT_DISTANCE;

    var viewMat = mat4.create();
    var positionVec = vec3.create();
    var distanceVec = vec3.create();
    var changed = true;

    this.changeAzimuth = function (deltaAzimuth) {
        azimuth += deltaAzimuth;
        azimuth = clamp(azimuth, MIN_AZIMUTH, MAX_AZIMUTH);
        changed = true;
    };

    this.changeElevation = function (deltaElevation) {
        elevation += deltaElevation;
        elevation = clamp(elevation, MIN_ELEVATION, MAX_ELEVATION);
        changed = true;
    };

    this.changeDistance = function (deltaDistance) {
    	distance += deltaDistance;
    	distance.clamp(distance, MIN_DISTANCE, MAX_DISTANCE);
    	changed = true;
    }

    var calculateParams = function() {
    	mat4.identity(viewMat);
    	mat4.rotateX(viewMat, viewMat, elevation);
    	mat4.rotateY(viewMat, viewMat, azimuth);
    	vec3.set(distanceVec, 0, 0, distance);
    	mat4.translate(viewMat, viewMat, distanceVec)

    	x = distance * Math.sin(Math.PI / 2 - elevation) * Math.sin(-azimuth);
        y = distance * Math.cos(Math.PI / 2 - elevation);
        z = distance * Math.sin(Math.PI / 2 - elevation) * Math.cos(-azimuth);
        vec3.set(positionVec, x, y, z);
    }

    this.getPosition = function () {
    	if (changed) {
			calculateParams();
			changed = false;
    	}
        return positionVec;
    };

    this.getViewMatrix = function () {
        if (changed) {
        	calculateParams();
            changed = false;
        }
        return viewMat;
    };
};