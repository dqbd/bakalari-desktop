app.factory("Progress", ["$rootScope", function($rootScope) {    

	this.showLoading = function() {
		$rootScope.loaded = false;

		this.hideError();
	}
	
	this.hideLoading = function() {
		$rootScope.loaded = true;
	}

	this.showPartialLoading = function() {
		//TOOD
	}

	this.hideError = function() {
		$rootScope.error = {show: false};
	}

	this.showError = function(string, type, stacktrace) {
		

		var base_url = location.protocol + "//" + location.hostname;

		if(typeof type === "undefined") {
			type = "error";
		}

		$rootScope.error = {show: true, type: type, text: string, stacktrace: stacktrace};
		this.hideLoading();
	}

	this.hideAll = function() {
		this.hideError();
		this.hideLoading();
	}

	return this;

}]);