app.controller("sidebarCtrl", ["$scope", "$rootScope", "$state", "Options", "Utils", function($scope, $rootScope, $state, Options, Utils) {
	$rootScope.pages = pages;
    $rootScope.colors = colors;

 	$scope.hidden = [];
    $scope.bg_class = "default";

    $scope.views = [];

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


    $scope.receiveOptions = function() {
		Options.getOption(Options.sidebarHiddenTag).then(function(data) {
	    	$scope.hidden = (data) ? data : [];

	    	$scope.init();
	    });

        Options.getOption(Options.sidebarBackgroundTag).then(function(data) {
            $scope.bg_class = (data) ? data : "default";
        });
    }

    $scope.capitalize = function(txt) {
        return Utils.capitalize(txt, false, true);
    };

    $scope.viewClick = function(name) {
        $rootScope.$emit("reload", {"view": name});
    }

    
    $rootScope.$on("reload", function(event, arg) {
        if(arg.user == true) {
            $scope.receiveOptions();
        }
    });

    $rootScope.$on("sidebar-views", function(event, pages) {
        $scope.views = pages;
    });
    
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