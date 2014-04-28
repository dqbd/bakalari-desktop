app.factory("Progress", ["$rootScope", function($rootScope) {    

	this.showLoading = function() {
		$rootScope.loaded = false;
		console.log("showing " + arguments.callee.caller.name);
	}
	
	this.hideLoading = function() {
		$rootScope.loaded = true;
		console.log("hiding " + arguments.callee.caller.toString());
	}

	this.hideError = function() {
		$rootScope.error = {show: false};
	}

	this.showError = function(string, type, stacktrace) {
		this.hideLoading();

		var base_url = location.protocol + "//" + location.hostname;

		if(typeof type === "undefined") {
			type = "error";
		}

		$rootScope.error = {show: true, type: type, text: string, stacktrace: stacktrace};
		$rootScope.loaded = true;
	}

	this.hideAll = function() {
		this.hideError();
		this.hideLoading();
	}

	return this;

}]);