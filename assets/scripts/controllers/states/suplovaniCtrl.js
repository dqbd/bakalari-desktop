app.controller("suplovaniCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "suplovani", "971031r", "dfiypam4").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;
    });

    $scope.formatDate = function(inp) {
    	var days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
    	var date = new Date(inp*1000);

    	return days[date.getDay()]+" "+date.getDate() + ". "+ (date.getMonth()+1) + ". "+date.getFullYear();
    }
}]);