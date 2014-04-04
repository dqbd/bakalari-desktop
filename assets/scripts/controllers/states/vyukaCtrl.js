app.controller("vyukaCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    //load data;
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "vyuka", "971031r", "dfiypam4").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;

        $scope.currentSubject = $scope.data;
    });


}]);