app.controller("planCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {
    
    Page.registerPage("plan", function(data) {
        $scope.data = $scope.sortToDay(data);    
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

    $scope.getRowNumber = function(number) {
        return Math.ceil(number / 3);
    }

    $scope.getRowItems = function(events, row) {
        return events.slice(row*3, (row+1)*3);
    }

    $scope.formatDate = Utils.formatDate;
}]);