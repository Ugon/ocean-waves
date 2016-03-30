var WIDTH = 		512;
var HEIGHT = 		512;

var A_POSITION_INDEX = 0;

var UNIT_TEXTURE_RANDOM_NORMAL_PAIRS = 0;
var UNIT_TEXTURE_INIT_HEIGHT_IN_FREQUENCY = 1;
var UNIT_TEXTURE_PING = 2;
var UNIT_TEXTURE_PONG = 3;

var TRANSFORM_SIZE = 512;
var AREA_SIZE = 50;

var WIND_X = 100;
var WIND_Y = 1;

var randomNormal = function() {
    return (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3;
}