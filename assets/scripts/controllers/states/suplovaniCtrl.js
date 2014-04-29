app.controller("suplovaniCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {

	var reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force, (arg.view) ? {"view" : arg.view} : {});
    });

    $scope.$on('$destroy', function() { reload_listener(); });

    $scope.load = function(force, arg) {
        Page.get("suplovani", force, arg).then(function(data) {
	        $scope.data = data;
	    });
	}

	$scope.load();
    $scope.formatDate = Utils.formatDate;
}]);