app.controller("suplovaniCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {

	$rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });
    
    
    $scope.load = function(force) {
    	$rootScope.loaded = false;
        Parser.get("suplovani", {}, force).then(function(d) {
	        $rootScope.loaded = true;
	        console.log($scope.data);
	        $scope.data = d.data.data;
	    });
	}

	$scope.load();
	
    $scope.formatDate = Utils.formatDate;
}]);