app.controller("suplovaniCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
	$rootScope.$on("reload", function() {
        $rootScope.loaded = false;
        $scope.load();
    });

    
    
    $scope.load = function() {

	    Parser.get("suplovani").then(function(d) {
	        $rootScope.loaded = true;
	        $scope.data = d.data.data;
	    });
	}

	$scope.load();
	
    $scope.formatDate = Utils.formatDate;
}]);