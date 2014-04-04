app.controller("planCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "akce", "971031r", "dfiypam4").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = $scope.sortToDay(d.data.data);

        
    });

    $scope.sortToDay = function(data) {
    	var result = {};
    	data.akce.forEach(function(item) {
			if(result[item["time"]["date"]] == null) {
				result[item["time"]["date"]] = [];
			}

			result[item["time"]["date"]].push(item);
    	});
    	return result;
    }

    $scope.formatDate = function(inp) {
    	var days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
    	var date = new Date(inp*1000);

    	return days[date.getDay()]+" "+date.getDate() + ". "+ (date.getMonth()+1) + ". "+date.getFullYear();
    }

}]);