app.controller("optionsCtrl", ["$scope", "$rootScope", "Utils", "Progress", "Options", function($scope, $rootScope, Utils, Progress, Options) {
	$scope.hidden = [];

	$scope.isVisible = function(name) {
		return ($scope.hidden.indexOf(name) == -1);
	}

	$scope.setVisibility = function(name) {

		if(!$scope.isVisible(name)) {
			$scope.hidden.splice($scope.hidden.indexOf(name), 1);
		} else {
			$scope.hidden.push(name);
		}

		Options.setOption(Options.sidebarHiddenTag, $scope.hidden);
	}


	Options.getOption(Options.sidebarHiddenTag).then(function(data) {
    	$scope.hidden = (data) ? data : [];

    	Progress.hideAll();
    });

}]);