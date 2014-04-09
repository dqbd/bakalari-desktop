app.controller("planCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    
    Parser.get("akce").then(function(d) {
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

    $scope.formatDate = Utils.formatDate;

}]);