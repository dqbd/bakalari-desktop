app.controller("planCtrl", ["$scope", "$rootScope", "Parser", "Utils", "Progress", function($scope, $rootScope, Parser, Utils, Progress) {
    
    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        
        $scope.load(arg.force);
    });

    
    $scope.load = function(force) {
        Progress.showLoading();
        Parser.get("akce", {}, force).then(function(d) {
            Progress.hideLoading();
            $scope.data = $scope.sortToDay(d.data.data);
        });
    }

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

    $scope.getRowNumber = function(number) {
        return Math.ceil(number / 3);
    }

    $scope.getRowItems = function(events, row) {
        return events.slice(row*3, (row+1)*3);
    }

    $scope.formatDate = Utils.formatDate;
    
    $scope.load();
}]);