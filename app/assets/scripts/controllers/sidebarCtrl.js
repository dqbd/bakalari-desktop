app.controller("sidebarCtrl", ["$scope", "$rootScope", "$state", "$q", "Options", "Utils", function($scope, $rootScope, $state, $q, Options, Utils) {
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

        var state = (data.length > 0) ? data[0].name : "options";

        if ($state.current.name == state) {
            $rootScope.$emit("reload");
        } else {
            $state.go(state);
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

    $scope.viewClick = function(index) {
        if(typeof $rootScope.canceler !== "undefined") {
            $rootScope.canceler.resolve();
        }
        
        $rootScope.canceler = $q.defer();

        $rootScope.$emit("reload", {"view": (index <= 0) ? false : $scope.views[index].value});
    }
    
    $rootScope.$on("user", function(event, arg) {
        $scope.receiveOptions();
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