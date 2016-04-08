var INDEX_BUFFER_FULLSCREEN = 0;
var INDEX_BUFFER_GRID = 1;

var UNIT_TEXTURE_RANDOM_COMPLEX_NUMBERS = 0;
var UNIT_TEXTURE_INIT_HEIGHT_IN_FREQUENCY = 1;
var UNIT_TEXTURE_HEIGHT_AFTER_T_IN_FREQUENCY = 2;
var UNIT_TEXTURE_HEIGHT_AFTER_T_IN_TIME = 3;
var UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_FREQUENCY = 4;
var UNIT_TEXTURE_DISPLACEMENT_AFTER_T_IN_TIME = 5;
var UNIT_TEXTURE_PING = 6;
var UNIT_TEXTURE_PONG = 7;

var TRANSFORM_SIZE = 512;

var PHILLIPS_CONST = 0.00003;
var DISPLACEMENT_CONST = 0.01;
var TIME_STEP = 0.01;

var AREA_SIZE = 45;

var WIND_X = 1;
var WIND_Y = -10;






/////////////////CAMERA////////////////
INIT_AZIMUTH = 0;
INIT_ELEVATION = Math.PI / 4;
INIT_DISTANCE = 1;

MIN_AZIMUTH = -Math.PI / 2;
MAX_AZIMUTH =  Math.PI / 2;

MIN_ELEVATION = 0;
MAX_ELEVATION = Math.PI / 2;

MIN_DISTANCE = 1;
MAX_DISTANCE = 1; 






String.prototype.format = function () {
        var args = [].slice.call(arguments);
        return this.replace(/(\{\d+\})/g, function (a){
            return args[+(a.substr(1,a.length-2))||0];
        });
};

var randomNormal = function() {
    return (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3;
}

var f2s = function(f) {
	var s = f.toString();
	if(s.includes('.')){
		return s;
	} else {
		return s + '.0';
	}
}