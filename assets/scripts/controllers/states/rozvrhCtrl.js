app.controller("rozvrhCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    //load data;
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "rozvrh", "971031r", "dfiypam4").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;

        console.log($scope.data);
    });



    $scope.isDefined = function(day, n) {
    	
    	return isNaN($scope.getNumber(day,n));
    	
    }

    $scope.getNumber = function(day, n) {

    	for(var x = 0; x < $scope.data.rozvrh[day]["lessons"].length; x++) {
    		var item = $scope.data.rozvrh[day]["lessons"][x];

    		if(parseInt(item["lesson"]) == n) {
				return item;
    		}
    	}

    	return null;
    }
    
}]);

