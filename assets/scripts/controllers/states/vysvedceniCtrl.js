app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    //load data;
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "vysvedceni", "971031r", "dfiypam4").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;
    });

    
}]);