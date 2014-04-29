app.controller("planCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {
    
    var reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force, (arg.view) ? {"view" : arg.view} : {});
    });

    $scope.$on('$destroy', function() { reload_listener(); });

    $scope.load = function(force, arg) {
        Page.get("akce", force, arg).then(function(data) {
            $scope.data = $scope.sortToDay(data);
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