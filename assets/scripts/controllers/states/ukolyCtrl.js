app.controller("ukolyCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {

	var viewstate = {}, reload_listener = $rootScope.$on("reload", function(event, arg) {
        arg = (arg) ? arg : {};

        viewstate = (arg.view != null) ? 
            ((arg.view != false) ? {"view": arg.view} : {}) : 
            ((!_.isEmpty(viewstate)) ? viewstate : {});

        $scope.load(arg.force, viewstate);
    });

    $scope.$on('$destroy', function() { 
        reload_listener(); 
        viewstate = {};
    });

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

    $scope.load(false, viewstate);
    
}]);