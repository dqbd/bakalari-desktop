app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "Parser", "Progress", function($scope, $rootScope, Parser, Progress) {

    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });

    $scope.load = function(force) {
        Progress.showLoading();
        Parser.get("vysvedceni", {}, force).then(function(d) {
	        Progress.hideLoading();
	        $scope.data = d.data.data;
	    });
	}

    $scope.load();

}]);