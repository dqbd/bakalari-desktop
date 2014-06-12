app.controller("suplovaniCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {

	Page.registerPage("suplovani", function(data) {
        $scope.data = data;
    });

    $scope.formatDate = Utils.formatDate;
}]);