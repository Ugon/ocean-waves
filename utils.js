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