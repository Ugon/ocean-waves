var Gui = function(guiDiv, statsDiv){  
    this.params = {};
    var params = this.params;

    params[PARAM_NAME_TRANSFORM_SIZE]      = PARAM_INIT_TRANSFORM_SIZE;
    params[PARAM_NAME_NO_TILES_HORIZONTAL] = PARAM_INIT_NO_TILES_HORIZONTAL;
    params[PARAM_NAME_NO_TILES_VERTICAL]   = PARAM_INIT_NO_TILES_VERTICAL;

    params[PARAM_NAME_PHILLIPS_CONST]      = PARAM_INIT_PHILLIPS_CONST;
    params[PARAM_NAME_SMALL_WAVE_SUPPRESS] = PARAM_INIT_SMALL_WAVE_SUPPRESS;
    params[PARAM_NAME_DISPLACEMENT_CONST]  = PARAM_INIT_DISPLACEMENT_CONST;

    params[PARAM_NAME_TIME_STEP]           = PARAM_INIT_TIME_STEP;
    params[PARAM_NAME_WIND_X]              = PARAM_INIT_WIND_X;
    params[PARAM_NAME_WIND_Y]              = PARAM_INIT_WIND_Y;
    params[PARAM_NAME_SIZE_CALC]           = PARAM_INIT_SIZE_CALC;
    params[PARAM_NAME_SCALE_HORIZONTAL]    = PARAM_INIT_SCALE_HORIZONTAL;
    params[PARAM_NAME_SCALE_VERTICAL]      = PARAM_INIT_SCALE_VERTICAL;

    params[PARAM_NAME_COLOR_OCEAN]         = PARAM_INIT_COLOR_OCEAN;
    params[PARAM_NAME_COLOR_SKY]           = PARAM_INIT_COLOR_SKY;
    params[PARAM_NAME_COLOR_SUN]           = PARAM_INIT_COLOR_SUN;

    params[PARAM_NAME_NORMAL_RATIO]        = PARAM_INIT_NORMAL_RATIO;
    params[PARAM_NAME_FRESNEL_BIAS_EXP]    = PARAM_INIT_FRESNEL_BIAS_EXP;
    params[PARAM_NAME_FRESNEL_BIAS_LIN]    = PARAM_INIT_FRESNEL_BIAS_LIN;
    params[PARAM_NAME_SEPCULAR_BIAS_EXP]   = PARAM_INIT_SEPCULAR_BIAS_EXP;
    params[PARAM_NAME_SEPCULAR_BIAS_LIN]   = PARAM_INIT_SEPCULAR_BIAS_LIN;
    params[PARAM_NAME_DIFFUSE_BIAS_EXP]    = PARAM_INIT_DIFFUSE_BIAS_EXP;
    params[PARAM_NAME_DIFFUSE_BIAS_LIN]    = PARAM_INIT_DIFFUSE_BIAS_LIN;

    params[PARAM_NAME_SUN_AZIMUTH]         = PARAM_INIT_SUN_AZIMUTH;
    params[PARAM_NAME_SUN_ELEVATION]       = PARAM_INIT_SUN_ELEVATION;
    params[PARAM_NAME_SUN_DISTANCE]        = PARAM_INIT_SUN_DISTANCE;
    params[PARAM_NAME_CAMERA_AZIMUTH]      = PARAM_INIT_CAMERA_AZIMUTH;
    params[PARAM_NAME_CAMERA_ELEVATION]    = PARAM_INIT_CAMERA_ELEVATION;
    params[PARAM_NAME_CAMERA_DISTANCE]     = PARAM_INIT_CAMERA_DISTANCE;

    params[PARAM_NAME_SHOW_FPS]            = PARAM_INIT_SHOW_FPS;
    params[PARAM_NAME_MOUSE_SPEED]         = PARAM_INIT_MOUSE_SPEED;
    params[PARAM_NAME_WHEEL_SPEED]         = PARAM_INIT_WHEEL_SPEED;
    
	params['changed'] = {};

    this.params.getChanges = function(){
    	var result = {};
    	for(var paramName in this.changed){
    		if (this.changed[paramName]){
    			result[paramName] = this[paramName];
    		}
    		this.changed[paramName] = false;
    	}
    	return result;
    }

    var params = this.params;

    var gui = new dat.GUI( { autoPlace: false } );

	var spectrumParams   = gui.addFolder('Spectrum');
	var conditionsParams = gui.addFolder('Conditions');
    var colorParams      = gui.addFolder('Color');
	var positionParams   = gui.addFolder('Position');
    var transformSize    = gui.addFolder('FFT Size');
	var controlParams    = gui.addFolder('Control');

    transformSize.add(params, PARAM_NAME_NO_TILES_HORIZONTAL , 1, 5).step(1);
    transformSize.add(params, PARAM_NAME_NO_TILES_VERTICAL   , 1, 5).step(1);

    spectrumParams.add(params, PARAM_NAME_PHILLIPS_CONST      , 0, 1);
    spectrumParams.add(params, PARAM_NAME_SMALL_WAVE_SUPPRESS , 0, 1);
    spectrumParams.add(params, PARAM_NAME_DISPLACEMENT_CONST  , 0, 1);

    conditionsParams.add(params, PARAM_NAME_TIME_STEP        , 0, 1);
    conditionsParams.add(params, PARAM_NAME_WIND_X           ,-1, 1);
    conditionsParams.add(params, PARAM_NAME_WIND_Y           ,-1, 1);
    conditionsParams.add(params, PARAM_NAME_SIZE_CALC        , 0, 1);
    conditionsParams.add(params, PARAM_NAME_SCALE_HORIZONTAL , 0, 1);
    conditionsParams.add(params, PARAM_NAME_SCALE_VERTICAL   , 0, 1);

    var oceanColorCtrl = colorParams.addColor(params, PARAM_NAME_COLOR_OCEAN , 0, 1);
    var skyColorCtrl   = colorParams.addColor(params, PARAM_NAME_COLOR_SKY   , 0, 1);
    var sunColorCtrl   = colorParams.addColor(params, PARAM_NAME_COLOR_SUN   , 0, 1);
   
    colorParams.add(params, PARAM_NAME_NORMAL_RATIO      , 0, 1);
    colorParams.add(params, PARAM_NAME_FRESNEL_BIAS_EXP  , 0, 1);
    colorParams.add(params, PARAM_NAME_FRESNEL_BIAS_LIN  , 0, 1);
    colorParams.add(params, PARAM_NAME_SEPCULAR_BIAS_EXP , 0, 1);
    colorParams.add(params, PARAM_NAME_SEPCULAR_BIAS_LIN , 0, 1);
    colorParams.add(params, PARAM_NAME_DIFFUSE_BIAS_EXP  , 0, 1);
    colorParams.add(params, PARAM_NAME_DIFFUSE_BIAS_LIN  , 0, 1);
    
    var fpsCtrl = controlParams.add(params, PARAM_NAME_SHOW_FPS    , 0, 1).listen();
                  controlParams.add(params, PARAM_NAME_MOUSE_SPEED , 0, 1);
                  controlParams.add(params, PARAM_NAME_WHEEL_SPEED , 0, 1);  

    positionParams.add(params, 
        PARAM_NAME_CAMERA_AZIMUTH, 
        PARAM_MIN_CAMERA_AZIMUTH, 
        PARAM_MAX_CAMERA_AZIMUTH).listen();
    positionParams.add(params, 
        PARAM_NAME_CAMERA_ELEVATION, 
        PARAM_MIN_CAMERA_ELEVATION, 
        PARAM_MAX_CAMERA_ELEVATION).listen();
    positionParams.add(params, PARAM_NAME_CAMERA_DISTANCE, 0, 1).listen();

    positionParams.add(params, 
        PARAM_NAME_SUN_AZIMUTH,
        PARAM_MIN_SUN_AZIMUTH,
        PARAM_MAX_SUN_AZIMUTH).listen();
    positionParams.add(params, 
        PARAM_NAME_SUN_ELEVATION,
        PARAM_MIN_SUN_ELEVATION,
        PARAM_MAX_SUN_ELEVATION).listen();
    positionParams.add(params, PARAM_NAME_SUN_DISTANCE, 0, 1).listen();

    //set changed
    var folders = gui.__folders;
    for(var folderInd in folders){
        var controllers = folders[folderInd].__controllers
        for(var controllerInd in controllers){
            var controller = controllers[controllerInd];
            var property = controller.property;

            params.changed[property] = false;
                
            var onChangeFun = (function(){
                var prop = property;
                return function() { params.changed[prop] = true; };
            })();

            controller.onChange(onChangeFun);
        }
    }

    //handle position changes
    for(var ctrlInd in positionParams.__controllers){
        var ctrl = positionParams.__controllers[ctrlInd];

        var onChangeFun = (function(){
            var property = ctrl.property;
            return function(value){
                params[property] = value;
                params.changed[property] = true;
            }
        })();

        ctrl.onChange(onChangeFun);
    }

    //mutex fft size
    for(var sizeInd in PARAM_POSS_TRANSFORM_SIZE){
    	var size = PARAM_POSS_TRANSFORM_SIZE[sizeInd];
    	params[size] = false;
    	var ctrl = transformSize.add(params, size, false).listen();

		var onChangeFun = (function(){
			var s = size;
			return function() {
				for(var sizeInd in PARAM_POSS_TRANSFORM_SIZE){
    				params[PARAM_POSS_TRANSFORM_SIZE[sizeInd]] = false;
    			}
           		params[s] = true; 
           		params[PARAM_NAME_TRANSFORM_SIZE] = s;
    			params.changed[PARAM_NAME_TRANSFORM_SIZE] = true;
            };
        })();

        ctrl.onChange(onChangeFun);
    }
    params[PARAM_INIT_TRANSFORM_SIZE] = true;

    //color string handling
    var colorOnChangeFun = function(paramName){
        var pName = paramName;
        return function(value){
            var val;
            if(typeof value === 'string'){
                var r = parseInt(value.substring(1, 3), 16);
                var g = parseInt(value.substring(3, 5), 16);
                var b = parseInt(value.substring(5, 7), 16);
                val = [r, g, b];
            } else {
                val = value;
            }
            params[pName] = val;
            params.changed[pName] = true;
        }
    }

    oceanColorCtrl.onChange(colorOnChangeFun(PARAM_NAME_COLOR_OCEAN));
    skyColorCtrl.onChange(  colorOnChangeFun(PARAM_NAME_COLOR_SKY));
    sunColorCtrl.onChange(  colorOnChangeFun(PARAM_NAME_COLOR_SUN));

    //handle FPS change
    var fpsOnChangeFun = function(value){
        if (value) statsDiv.style.visibility = 'visible';
        else       statsDiv.style.visibility = 'hidden';
    }

    fpsCtrl.onChange(fpsOnChangeFun);
    fpsOnChangeFun(params[PARAM_NAME_SHOW_FPS]);

    gui.open();

    guiDiv.appendChild(gui.domElement);
}