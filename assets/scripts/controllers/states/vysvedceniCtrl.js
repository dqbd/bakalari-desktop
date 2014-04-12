app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "Parser", function($scope, $rootScope, Parser) {
    //load data;
    
    $rootScope.$on("reload", function() {
        $rootScope.loaded = false;
        $scope.load();
    });

    
    
    $scope.load = function() {
	    Parser.get("vysvedceni").then(function(d) {
	        $rootScope.loaded = true;
	        $scope.data = d.data.data;
	    });
	}

    $scope.load();

}]);