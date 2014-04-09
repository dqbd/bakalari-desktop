app.controller("suplovaniCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    Parser.get("suplovani").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;
    });

    $scope.formatDate = Utils.formatDate;
}]);