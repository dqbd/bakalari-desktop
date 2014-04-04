app.controller("absenceCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    //load data;
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "absence", "971031r", "dfiypam4").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = $scope.sortByMissing(d.data.data);

        $scope.charts = $scope.generateCharts($scope.data);

       console.log( $scope.generateCharts($scope.data));

    });


    $scope.generateCharts = function(data) {
        var missing = [];
        var total = [];

        var missingNum = 0;
        var totalNum = 0;
        data.absence.forEach(function(item) {
            var color = $scope.stringToColor(item.name)["background-color"];

            missingNum += parseInt(item.missing);
            totalNum += parseInt(item.total);

            missing.push({value: parseInt(item.missing), color: color});
            total.push({value: parseInt(item.total), color: color});
        });
        
        var whole = [{value: (missingNum / totalNum), color: "#e74c3c"}, {value: 1 -(missingNum/totalNum), color: "#27ae60"}];

        return {"missing": missing, "total": total, "whole": whole};
    }

    $scope.sortByMissing = function(data) {
    	data.absence.sort(function(x, y) {

			if($scope.calculatePercentage(x.missing, x.total) != $scope.calculatePercentage(y.missing, y.total)) {
				return ($scope.calculatePercentage(x.missing, x.total) > $scope.calculatePercentage(y.missing, y.total)) ? -1 : 1;
			}

			return (x.total != y.total) ? ((x.total > y.total) ? -1 : 1) : 0;
    	});
    	
    	return data;
    }

    $scope.stringToColor = function(string) {
        hash = 0;
        for(var x = 0; x < string.length; x++) {
            hash = string.charCodeAt(x) + ((hash << 5) - hash);
        }

        var color = ((hash>>24)&0xFF).toString(16) +
            		((hash>>16)&0xFF).toString(16) +
            		((hash>>8)&0xFF).toString(16) +
            		(hash&0xFF).toString(16);

        return {"background-color": "#"+color.substr(0, 6)};
        
    }


    $scope.calculatePercentage = function(missing, total) {
    	return ((missing / total) * 100).toFixed(2);
    }
}]);