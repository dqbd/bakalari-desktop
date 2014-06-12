app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "Page", function($scope, $rootScope, Page) {
    Page.registerPage("vysvedceni", function(data) {
        $scope.data = data;
    });

    $scope.load = function(force, arg) {
        Page.get("vysvedceni", force, arg).then(function(data) {
	        $scope.data = data;
	    });
	}
}]);