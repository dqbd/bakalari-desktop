app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "Page", function($scope, $rootScope, Page) {

    var reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force, (arg.view) ? {"view" : arg.view} : {});
    });

    $scope.$on('$destroy', function() { reload_listener(); });

    $scope.load = function(force, arg) {
        Page.get("vysvedceni", force, arg).then(function(data) {
	        $scope.data = data;
	    });
	}

    $scope.load();

}]);