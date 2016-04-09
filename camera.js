var Camera = function () {
    var azimuth = INIT_AZIMUTH;
    var elevation = INIT_ELEVATION;
    var distance = INIT_DISTANCE;

    var viewMatrix = mat4.create();
    var positionVec = vec3.create();
    var distanceVec = vec3.create();
    var changed = true;

    var clamp = function (num, lowBound, highBound) {
        return Math.min(Math.max(num, lowBound), highBound);
    }

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
        vec3.set(distanceVec, 0, 0, -distance);

        mat4.identity(viewMatrix);
        mat4.translate(viewMatrix, viewMatrix, distanceVec)
        mat4.rotateX(viewMatrix, viewMatrix, elevation);
        mat4.rotateY(viewMatrix, viewMatrix, azimuth);


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
        return viewMatrix;
    };
};