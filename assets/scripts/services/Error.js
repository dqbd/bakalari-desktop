app.factory("Error", ["$rootScope", function($rootScope) {    

	return {
		hideError: function() {
			$rootScope.error =  {show: false};
		},
		showError: function(string, type, stacktrace) {
			var base_url = location.protocol + "//" + location.hostname;

			if(typeof type === "undefined") {
				type = "error";
			}

			$rootScope.error = {show: true, type: type, text: string, stacktrace: stacktrace};
			$rootScope.loaded = true;
		}
	}

}]);