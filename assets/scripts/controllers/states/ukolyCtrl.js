app.controller("ukolyCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {

    var reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force, (arg.view) ? {"view" : arg.view} : {});
    });

    $scope.$on('$destroy', function() { reload_listener(); });

    $scope.load = function(force, arg) {
        Page.get("ukoly", force, arg).then(function(data) {
	        $scope.data = $scope.sortData(data);
	    });
	};

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

    $scope.load();
    
}]);