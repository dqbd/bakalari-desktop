app.factory("Progress", ["$rootScope", function($rootScope) {    

	return {
		showLoading: function() {
			$rootScope.loaded = false;
		},
		hideLoading: function() {
			$rootScope.loaded = true;
		},
		hideError: function() {
			$rootScope.error =  {show: false};
		},
		showError: function(string, type, stacktrace) {
			this.hideLoading();

			var base_url = location.protocol + "//" + location.hostname;

			if(typeof type === "undefined") {
				type = "error";
			}

			$rootScope.error = {show: true, type: type, text: string, stacktrace: stacktrace};
			$rootScope.loaded = true;
		},
		hideAll: function() {
			this.hideError();
			this.hideLoading();
		}
	}

}]);