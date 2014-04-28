app.controller("suplovaniCtrl", ["$scope", "$rootScope", "Parser", "Utils", "Progress", function($scope, $rootScope, Parser, Utils, Progress) {

	$rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });
    
    
    $scope.load = function(force) {
    	Progress.showLoading();
    	
        Parser.get("suplovani", {}, force).then(function(d) {
	        Progress.hideLoading();
	        $scope.data = d.data.data;
	    });
	}

	$scope.load();
	
    $scope.formatDate = Utils.formatDate;
}]);