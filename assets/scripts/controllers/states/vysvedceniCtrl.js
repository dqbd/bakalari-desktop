app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "Parser", function($scope, $rootScope, Parser) {
    //load data;
    Parser.get("vysvedceni").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;
    });

    
}]);