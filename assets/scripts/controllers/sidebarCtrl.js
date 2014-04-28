app.controller("sidebarCtrl", ["$scope", "$rootScope", "$state", "Options", function($scope, $rootScope, $state, Options) {
	$rootScope.pages = pages;
    $rootScope.colors = colors;

 	$scope.hidden = [];
    $scope.bg_class = "default";

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
	    });

        Options.getOption(Options.sidebarBackgroundTag).then(function(data) {
            $scope.bg_class = (data) ? data : "default";
        });
    }

    
    Options.registerObserver(function(data) {
        if(data[Options.sidebarHiddenTag]) {
    	   $scope.hidden = data[Options.sidebarHiddenTag];
        }

        if(data[Options.sidebarBackgroundTag]) {
            $scope.bg_class = data[Options.sidebarBackgroundTag];
        }
    });

    $scope.receiveOptions();
}]);