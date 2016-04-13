

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


var PARAM_NAME_TRANSFORM_SIZE = 'transformSize';
var PARAM_INIT_TRANSFORM_SIZE = 512;
var PARAM_POSS_TRANSFORM_SIZE = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

var PARAM_NAME_PHILLIPS_CONST = 'phillipsConst';
var PARAM_INIT_PHILLIPS_CONST = 0.2;
var PARAM_CALC_PHILLIPS_CONST = function(value){
	return value / 100;
};

var PARAM_NAME_SMALL_WAVE_SUPPRESS = 'smoothness';
var PARAM_INIT_SMALL_WAVE_SUPPRESS = 0.5;
var PARAM_CALC_SMALL_WAVE_SUPPRESS = function(value){
	return Math.pow(1000000, value);
};

var PARAM_NAME_DISPLACEMENT_CONST = 'displacement';
var PARAM_INIT_DISPLACEMENT_CONST = 0.2;
var PARAM_CALC_DISPLACEMENT_CONST = function(value){
	return value * 0.5;
};

var PARAM_NAME_TIME_STEP = 'speed';
var PARAM_INIT_TIME_STEP = 0.4;
var PARAM_CALC_TIME_STEP = function(value){
	return value / 40;
};

var PARAM_NAME_WIND_X = 'windX';
var PARAM_INIT_WIND_X = 0.3;
var PARAM_CALC_WIND_X = function(value){
	return value * 10;
};

var PARAM_NAME_WIND_Y = 'windY';
var PARAM_INIT_WIND_Y = 0.4;
var PARAM_CALC_WIND_Y = function(value){
	return value * 10;
};

var PARAM_NAME_SIZE_CALC = 'sizeCalc';
var PARAM_INIT_SIZE_CALC = 0.3;
var PARAM_CALC_SIZE_CALC = function(value){
	return value * 30;
};

var PARAM_NAME_SCALE_HORIZONTAL = 'scaleHorizontal';
var PARAM_INIT_SCALE_HORIZONTAL = 0.5;
var PARAM_CALC_SCALE_HORIZONTAL = function(value){
	return (value + 1) * 2;
};

var PARAM_NAME_SCALE_VERTICAL = 'scaleVertical';
var PARAM_INIT_SCALE_VERTICAL = 0.4;
var PARAM_CALC_SCALE_VERTICAL = function(value){
	return (value + 1) * 2;
};

var PARAM_NAME_COLOR_BOTTOM = 'bottom';
var PARAM_INIT_COLOR_BOTTOM = 0.1;
var PARAM_CALC_COLOR_BOTTOM = function(value){
	return value;
};

var PARAM_NAME_COLOR_SKY = 'sky';
var PARAM_INIT_COLOR_SKY = 0.1;
var PARAM_CALC_COLOR_SKY = function(value){
	return value;
};

var PARAM_NAME_COLOR_SUN = 'sun';
var PARAM_INIT_COLOR_SUN = 0.1;
var PARAM_CALC_COLOR_SUN = function(value){
	return value;
};

var PARAM_NAME_SUN_X = 'sunX';
var PARAM_INIT_SUN_X = 0.1;
var PARAM_CALC_SUN_X = function(value){
	return value;
};

var PARAM_NAME_SUN_Y = 'sunY';
var PARAM_INIT_SUN_Y = 0.1;
var PARAM_CALC_SUN_Y = function(value){
	return value;
};

var PARAM_NAME_SUN_Z = 'sunZ';
var PARAM_INIT_SUN_Z = 0.1;
var PARAM_CALC_SUN_Z = function(value){
	return value;
};

var PARAM_NAME_MOUSE_SPEED = 'mouseSpeed';
var PARAM_INIT_MOUSE_SPEED = 0.4;
var PARAM_CALC_MOUSE_SPEED = function(value){
	return value / 100;
};

var PARAM_NAME_WHEEL_SPEED = 'wheelSpeed';
var PARAM_INIT_WHEEL_SPEED = 0.01;
var PARAM_CALC_WHEEL_SPEED = function(value){
	return value;
};


























/////////////////INIT////////////////
var PHILLIPS_CONST = 0.001;
var SMALL_WAVES_SUPPRESS;

/////////////////DYNAMIC////////////////

var TIME_STEP = 0.01;

var AREA_SIZE_CALC = 15;
var AREA_SIZE_DISP;


var DISPLACEMENT_CONST = 0.1;
var SUN_POSITION;


var BOTTOM_COLOR;
var SKY_COLOR;
var SUN_COLOR;


/////////////////VISUAL////////////////
var WIND_X = 10000;
var WIND_Y = 10000;






/////////////////INPUT////////////////

MOUSE_SENSITIVITY = 0.001;
WHEEL_SENSIVITY = 0.01;








INIT_AZIMUTH =  Math.PI / 3;
MIN_AZIMUTH  =  Number.NEGATIVE_INFINITY;
MAX_AZIMUTH  =  Number.POSITIVE_INFINITY;

INIT_ELEVATION = (45 / 180) * Math.PI;
MIN_ELEVATION  = (5 / 180) * Math.PI;
MAX_ELEVATION  = (75 / 180) * Math.PI;

INIT_DISTANCE = 2.5;
MIN_DISTANCE  = 0;
MAX_DISTANCE  = 1000; 



NEAR = 0;
FAR = 10000;
FOV = (60 / 180) * Math.PI;






