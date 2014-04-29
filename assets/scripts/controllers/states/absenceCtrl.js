app.controller("absenceCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {

    var reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force, (arg.view) ? {"view" : arg.view} : {});
    });

    $scope.$on('$destroy', function() { reload_listener(); });

    $scope.load = function(force, arg) {
        Page.get("absence", force, arg).then(function(data) {
            $scope.data = $scope.sortByMissing(data);
            $scope.charts = $scope.generateCharts($scope.data);
        });
    }

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
        
        var whole = [{value: (missingNum / totalNum), color: "#e74c3c"}, {value: 1-(missingNum/totalNum), color: "#27ae60"}];

        

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


    $scope.calculatePercentage = function(missing, total) {
    	return ((missing / total) * 100).toFixed(2);
    }

    $scope.stringToColor = Utils.subjectToColor;

    $scope.load();
}]);