app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "Parser", function($scope, $rootScope, Parser) {

    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });

    $scope.load = function(force) {
        $rootScope.loaded = false;
        Parser.get("vysvedceni", {}, force).then(function(d) {
	        $rootScope.loaded = true;
	        $scope.data = d.data.data;
	    });
	}

    $scope.load();

}]);