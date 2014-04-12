app.controller("ukolyCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    //load data;
    //
    $rootScope.$on("reload", function() {
        $rootScope.loaded = false;
        $scope.load();
    });

    
    
    $scope.load = function() {

	    Parser.get("ukoly").then(function(d) {
	        $rootScope.loaded = true;
	        $scope.data = $scope.sortData(d.data.data);
	    });
	};

	$scope.load();

    $scope.sortData = function(data) {
		var result = {};

		data.ukoly.forEach(function(item) {
			if(result[item["date"]] == null) {
				result[item["date"]] = {};
			}

			if(result[item["date"]][item["subject"]] == null) {
				result[item["date"]][item["subject"]] = [];
			}

			result[item["date"]][item["subject"]].push(item.detail);
		});

		return result;
    };

    $scope.formatDate = Utils.formatDate;
    $scope.assignIcon = Utils.subjectToColor;
    
}]);