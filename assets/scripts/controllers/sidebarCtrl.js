app.controller("sidebarCtrl", ["$scope", "$rootScope", "$state", "Options", function($scope, $rootScope, $state, Options) {
 	$rootScope.pages = pages;

 	$scope.hidden = [];

	$scope.refresh = function() {
        $rootScope.$emit("reload", {force: true});
    };

    $scope.filterShown = function() {
    	return function(item) {
		    return ($scope.hidden.indexOf(item.name) == -1) && item.show == true;
	  	};
    }

    $scope.init = function() {
    	var data = $rootScope.pages.filter(function(item) {
    		return ($scope.hidden.indexOf(item.name) == -1) && item.show == true;
    	});

    	if(data.length > 0) {
    		$state.go(data[0].name);
    	} else {
    		$state.go("options");
    	}
    }

    $rootScope.$on("reload", function(event, arg) {
        $scope.receiveOptions();
    });

    $scope.receiveOptions = function() {
		Options.getOption(Options.sidebarHiddenTag).then(function(data) {
	    	$scope.hidden = (data) ? data : [];

	    	$scope.init();
	    })
    }

    
    Options.registerObserver(function(data) {
    	$scope.hidden = data[Options.sidebarHiddenTag];
    });

    $scope.receiveOptions();
}]);