var clamp = function (num, lowBound, highBound) {
    return Math.min(Math.max(num, lowBound), highBound);
}

var PARAM_NAME_TRANSFORM_SIZE = 'transformSize';
var PARAM_INIT_TRANSFORM_SIZE = 512;
var PARAM_POSS_TRANSFORM_SIZE = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

var PARAM_NAME_NO_TILES_HORIZONTAL = 'tilesHorizontal';
var PARAM_INIT_NO_TILES_HORIZONTAL = 2;

var PARAM_NAME_NO_TILES_VERTICAL = 'tilesVertical';
var PARAM_INIT_NO_TILES_VERTICAL = 2;

var PARAM_NAME_PHILLIPS_CONST = 'phillipsConst';
var PARAM_INIT_PHILLIPS_CONST = 0.2;
var PARAM_CALC_PHILLIPS_CONST = function(value){
	return value / 100;
}

var PARAM_NAME_SMALL_WAVE_SUPPRESS = 'smoothness';
var PARAM_INIT_SMALL_WAVE_SUPPRESS = 0.5;
var PARAM_CALC_SMALL_WAVE_SUPPRESS = function(value){
	return Math.pow(1000000, value);
}

var PARAM_NAME_DISPLACEMENT_CONST = 'displacement';
var PARAM_INIT_DISPLACEMENT_CONST = 0.5;
var PARAM_CALC_DISPLACEMENT_CONST = function(value){
	return value * 0.5;
}

var PARAM_NAME_TIME_STEP = 'speed';
var PARAM_INIT_TIME_STEP = 0.4;
var PARAM_CALC_TIME_STEP = function(value){
	return value / 40;
}

var PARAM_NAME_WIND_X = 'windX';
var PARAM_INIT_WIND_X = 0.35;
var PARAM_CALC_WIND_X = function(value){
	return value * 10;
}

var PARAM_NAME_WIND_Y = 'windY';
var PARAM_INIT_WIND_Y = 0.25;
var PARAM_CALC_WIND_Y = function(value){
	return value * 10;
}

var PARAM_NAME_SIZE_CALC = 'sizeCalc';
var PARAM_INIT_SIZE_CALC = 0.3;
var PARAM_CALC_SIZE_CALC = function(value){
	return value * 30;
}

var PARAM_NAME_SCALE_HORIZONTAL = 'scaleHorizontal';
var PARAM_INIT_SCALE_HORIZONTAL = 0.3;
var PARAM_CALC_SCALE_HORIZONTAL = function(value){
	return value * 20 + 1;
}

var PARAM_NAME_SCALE_VERTICAL = 'scaleVertical';
var PARAM_INIT_SCALE_VERTICAL = 0.2;
var PARAM_CALC_SCALE_VERTICAL = function(value){
	return value * 20 + 1;
}

var PARAM_NAME_NORMAL_RATIO = 'normalPreciseRatio';
var PARAM_INIT_NORMAL_RATIO = 0.5;
var PARAM_CALC_NORMAL_RATIO = function(value){
	return value;
}

var PARAM_NAME_COLOR_SKY = 'sky';
var PARAM_INIT_COLOR_SKY = [0.10, 0.70, 1.00].map(function(v){return v * 255});
var PARAM_CALC_COLOR_SKY = function(value){
	return value.map(function(v){return v / 255});
}

var PARAM_NAME_COLOR_OCEAN = 'ocean';
var PARAM_INIT_COLOR_OCEAN = [0.04, 0.06, 0.27].map(function(v){return v * 255});
var PARAM_CALC_COLOR_OCEAN = function(value){
	return value.map(function(v){return v / 255});
}

var PARAM_NAME_COLOR_SUN = 'sun';
var PARAM_INIT_COLOR_SUN = [1.00, 1.00, 0.30].map(function(v){return v * 255});
var PARAM_CALC_COLOR_SUN = function(value){
	return value.map(function(v){return v / 255});
}

var PARAM_NAME_HDR = 'hdr';
var PARAM_INIT_HDR = 0.2;
var PARAM_CALC_HDR = function(value){
	return value * 4;
}

var PARAM_NAME_FRESNEL_BIAS_EXP = 'fresnelBiasExp';
var PARAM_INIT_FRESNEL_BIAS_EXP = 0.7;
var PARAM_CALC_FRESNEL_BIAS_EXP = function(value){
	return 10 * value;
}

var PARAM_NAME_FRESNEL_BIAS_LIN = 'fresnelBiasLin';
var PARAM_INIT_FRESNEL_BIAS_LIN = 0.25;
var PARAM_CALC_FRESNEL_BIAS_LIN = function(value){
	return Math.pow(8, value);
}

var PARAM_NAME_SPECULAR_BLINN_RATIO = 'specularBlinnRatio';
var PARAM_INIT_SPECULAR_BLINN_RATIO = 0.5;
var PARAM_CALC_SPECULAR_BLINN_RATIO = function(value){
	return value;
}

var PARAM_NAME_BLINN_PHONG_BIAS_EXP = 'blinnPhongBiasExp';
var PARAM_INIT_BLINN_PHONG_BIAS_EXP = 0.3;
var PARAM_CALC_BLINN_PHONG_BIAS_EXP = function(value){
	return Math.pow(10000, (value * 0.75 + 0.25));
}

var PARAM_NAME_BLINN_PHONG_BIAS_LIN = 'blinnPhongBiasLin';
var PARAM_INIT_BLINN_PHONG_BIAS_LIN = 0.5;
var PARAM_CALC_BLINN_PHONG_BIAS_LIN = function(value){
	return value * 5;
}

var PARAM_NAME_PHONG_BIAS_EXP = 'phongBiasExp';
var PARAM_INIT_PHONG_BIAS_EXP = 0.3;
var PARAM_CALC_PHONG_BIAS_EXP = function(value){
	return Math.pow(10000, (value * 0.75 + 0.25));
}

var PARAM_NAME_PHONG_BIAS_LIN = 'phongBiasLin';
var PARAM_INIT_PHONG_BIAS_LIN = 0.5;
var PARAM_CALC_PHONG_BIAS_LIN = function(value){
	return value * 5;
}

var PARAM_NAME_DIFFUSE_BIAS_EXP = 'diffuseBiasExp';
var PARAM_INIT_DIFFUSE_BIAS_EXP = 0.5;
var PARAM_CALC_DIFFUSE_BIAS_EXP = function(value){
	return Math.pow(50, value);
}

var PARAM_NAME_DIFFUSE_BIAS_LIN = 'diffuseBiasLin';
var PARAM_INIT_DIFFUSE_BIAS_LIN = 0.5;
var PARAM_CALC_DIFFUSE_BIAS_LIN = function(value){
	return Math.pow(4, value) - 1;
}

var PARAM_NAME_SUN_AZIMUTH = 'sunAzimuth';
var PARAM_MIN_SUN_AZIMUTH = 0;
var PARAM_MAX_SUN_AZIMUTH = 360;
var PARAM_INIT_SUN_AZIMUTH = 0;
var PARAM_CALC_SUN_AZIMUTH = function(value){
	return value / 180 * Math.PI - Math.PI;
}
var PARAM_CALC_INV_SUN_AZIMUTH = function(value){
	return clamp((value + 360) % 360, PARAM_MIN_SUN_AZIMUTH, PARAM_MAX_SUN_AZIMUTH);
}

var PARAM_NAME_SUN_ELEVATION = 'sunElevation';
var PARAM_MIN_SUN_ELEVATION = 5;
var PARAM_MAX_SUN_ELEVATION = 85;
var PARAM_INIT_SUN_ELEVATION = 10;
var PARAM_CALC_SUN_ELEVATION = function(value){
	return value / 180 * Math.PI;
}
var PARAM_CALC_INV_SUN_ELEVATION = function(value){
	return clamp((value + 360) % 360, PARAM_MIN_SUN_ELEVATION, PARAM_MAX_SUN_ELEVATION);
}

var PARAM_NAME_SUN_DISTANCE = 'sunDistance';
var PARAM_MIN_SUN_DISTANCE = 10;
var PARAM_MAX_SUN_DISTANCE = 1000;
var PARAM_INIT_SUN_DISTANCE = 0.5;
var PARAM_CALC_SUN_DISTANCE = function(value){
	return Math.pow(PARAM_MAX_SUN_DISTANCE - PARAM_MIN_SUN_DISTANCE, value) + PARAM_MIN_SUN_DISTANCE;
}
var PARAM_CALC_INV_SUN_DISTANCE = function(value){
	return clamp(value, 0, 1);
}

var PARAM_NAME_CAMERA_AZIMUTH = 'cameraAzimuth';
var PARAM_MIN_CAMERA_AZIMUTH  = 0;
var PARAM_MAX_CAMERA_AZIMUTH  = 360;
var PARAM_INIT_CAMERA_AZIMUTH = 180;
var PARAM_CALC_CAMERA_AZIMUTH = function(value){
	return value / 180 * Math.PI - Math.PI;
}
var PARAM_CALC_INV_CAMERA_AZIMUTH = function(value){
	return clamp((value + 360) % 360, PARAM_MIN_CAMERA_AZIMUTH, PARAM_MAX_CAMERA_AZIMUTH);
}

var PARAM_NAME_CAMERA_ELEVATION = 'cameraElevation';
var PARAM_MIN_CAMERA_ELEVATION  = 5;
var PARAM_MAX_CAMERA_ELEVATION  = 85;
var PARAM_INIT_CAMERA_ELEVATION = 45;
var PARAM_CALC_CAMERA_ELEVATION = function(value){
	return value / 180 * Math.PI;
}
var PARAM_CALC_INV_CAMERA_ELEVATION = function(value){
	return clamp((value + 360) % 360, PARAM_MIN_CAMERA_ELEVATION, PARAM_MAX_CAMERA_ELEVATION);
}

var PARAM_NAME_CAMERA_DISTANCE = 'cameraDistance';
var PARAM_MIN_CAMERA_DISTANCE  = 2;
var PARAM_MAX_CAMERA_DISTANCE  = 50; 
var PARAM_INIT_CAMERA_DISTANCE = 0.5;
var PARAM_CALC_CAMERA_DISTANCE = function(value){
	return value * (PARAM_MAX_CAMERA_DISTANCE - PARAM_MIN_CAMERA_DISTANCE) + PARAM_MIN_CAMERA_DISTANCE;
}
var PARAM_CALC_INV_CAMERA_DISTANCE = function(value){
	return clamp(value, 0, 1);
}

var PARAM_NAME_SHOW_FPS = 'showFPS';
var PARAM_INIT_SHOW_FPS = false;

var PARAM_NAME_MOUSE_SPEED = 'mouseSpeed';
var PARAM_INIT_MOUSE_SPEED = 0.5;
var PARAM_CALC_MOUSE_SPEED = function(value){
	return value / 4;
}

var PARAM_NAME_WHEEL_SPEED = 'wheelSpeed';
var PARAM_INIT_WHEEL_SPEED = 0.1;
var PARAM_CALC_WHEEL_SPEED = function(value){
	return value / 250;
}

var PARAM_NEAR = 0;
var PARAM_FAR  = 10000;
var PARAM_FOV  = (60 / 180) * Math.PI;

var INDEX_BUFFER_FULLSCREEN = 0;
var INDEX_BUFFER_OCEAN = 1;

var UNIT_TEXTURE_RANDOM_COMPLEX_NUMBERS = 0;
var UNIT_TEXTURE_INIT_HEIGHT_IN_FREQUENCY = 1;
var UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY = 2;
var UNIT_TEXTURE_HEIGHT_AFTER_T_IN_TIME = 3;
var UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_FREQUENCY = 4;
var UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_TIME = 5;
var UNIT_TEXTURE_SLOPE_AFTER_T_IN_FREQUENCY = 6;
var UNIT_TEXTURE_SLOPE_AFTER_T_IN_TIME = 7;
var UNIT_TEXTURE_PING = 8;
var UNIT_TEXTURE_PONG = 9;