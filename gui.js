var Gui = function(guiDiv){  
    this.params = {};
    var params = this.params;

    params[PARAM_NAME_TRANSFORM_SIZE]      = PARAM_INIT_TRANSFORM_SIZE;

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

    params[PARAM_NAME_FRESNEL_BIAS_EXP]    = PARAM_INIT_FRESNEL_BIAS_EXP;
    params[PARAM_NAME_FRESNEL_BIAS_LIN]    = PARAM_INIT_FRESNEL_BIAS_LIN;
    params[PARAM_NAME_SEPCULAR_BIAS_EXP]   = PARAM_INIT_SEPCULAR_BIAS_EXP;
    params[PARAM_NAME_SEPCULAR_BIAS_LIN]   = PARAM_INIT_SEPCULAR_BIAS_LIN;
    params[PARAM_NAME_DIFFUSE_BIAS_EXP]    = PARAM_INIT_DIFFUSE_BIAS_EXP;
    params[PARAM_NAME_DIFFUSE_BIAS_LIN]    = PARAM_INIT_DIFFUSE_BIAS_LIN;

    params[PARAM_NAME_NORMAL_PRECISE]      = PARAM_INIT_NORMAL_PRECISE;
    params[PARAM_NAME_NORMAL_FIN_DIFF]     = PARAM_INIT_NORMAL_FIN_DIFF;

	params[PARAM_NAME_SUN_X]               = PARAM_INIT_SUN_X;
	params[PARAM_NAME_SUN_Y]               = PARAM_INIT_SUN_Y;
	params[PARAM_NAME_SUN_Z]               = PARAM_INIT_SUN_Z;

	params[PARAM_NAME_MOUSE_SPEED]         = PARAM_INIT_MOUSE_SPEED;
	params[PARAM_NAME_WHEEL_SPEED]         = PARAM_INIT_WHEEL_SPEED;

	params['changed'] =  {};


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
	var controlParams    = gui.addFolder('Control');
	var transformSize    = gui.addFolder('FFT Size');

    spectrumParams.add(params, PARAM_NAME_PHILLIPS_CONST      , 0, 1);
    spectrumParams.add(params, PARAM_NAME_SMALL_WAVE_SUPPRESS , 0, 1);
    spectrumParams.add(params, PARAM_NAME_DISPLACEMENT_CONST  , 0, 1);

    conditionsParams.add(params, PARAM_NAME_TIME_STEP        , 0, 1);
    conditionsParams.add(params, PARAM_NAME_WIND_X           ,-1, 1);
    conditionsParams.add(params, PARAM_NAME_WIND_Y           ,-1, 1);
    conditionsParams.add(params, PARAM_NAME_SIZE_CALC        , 0, 1);
    conditionsParams.add(params, PARAM_NAME_SCALE_HORIZONTAL , 0, 1);
    conditionsParams.add(params, PARAM_NAME_SCALE_VERTICAL   , 0, 1);

    colorParams.addColor(params, PARAM_NAME_COLOR_OCEAN , 0, 1);
    colorParams.addColor(params, PARAM_NAME_COLOR_SKY   , 0, 1);
    colorParams.addColor(params, PARAM_NAME_COLOR_SUN   , 0, 1);
    
    colorParams.add(params, PARAM_NAME_FRESNEL_BIAS_EXP  , 0, 1);
    colorParams.add(params, PARAM_NAME_FRESNEL_BIAS_LIN  , 0, 1);
    colorParams.add(params, PARAM_NAME_SEPCULAR_BIAS_EXP , 0, 1);
    colorParams.add(params, PARAM_NAME_SEPCULAR_BIAS_LIN , 0, 1);
    colorParams.add(params, PARAM_NAME_DIFFUSE_BIAS_EXP  , 0, 1);
    colorParams.add(params, PARAM_NAME_DIFFUSE_BIAS_LIN  , 0, 1);
    
    colorParams.add(params, PARAM_NAME_SUN_X , 0, 1);
    colorParams.add(params, PARAM_NAME_SUN_Y , 0, 1);
    colorParams.add(params, PARAM_NAME_SUN_Z , 0, 1);

    controlParams.add(params, PARAM_NAME_MOUSE_SPEED , 0, 1);
    controlParams.add(params, PARAM_NAME_WHEEL_SPEED , 0, 1);  

    var normalPrecCtrl = colorParams.add(params, PARAM_NAME_NORMAL_PRECISE).listen();
    var normalFinCtrl  = colorParams.add(params, PARAM_NAME_NORMAL_FIN_DIFF).listen();

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

    //validate normal
    normalPrecCtrl.onChange(function(){
        if (!params[PARAM_NAME_NORMAL_FIN_DIFF]){
            params[PARAM_NAME_NORMAL_PRECISE] = true;
        } else {
            console.log('prec');
            params.changed[PARAM_NAME_NORMAL_PRECISE] = true;
        }
    });

    normalFinCtrl.onChange(function(){
        if (!params[PARAM_NAME_NORMAL_PRECISE]){
            params[PARAM_NAME_NORMAL_FIN_DIFF] = true;
        } else {
            console.log('fin');
            params.changed[PARAM_NAME_NORMAL_FIN_DIFF] = true;
        }
    });

    // spectrumParams.open();
    // conditionsParams.open();
    colorParams.open();
    // controlParams.open();
    gui.open();

    console.log(this);

    guiDiv.appendChild(gui.domElement);
}