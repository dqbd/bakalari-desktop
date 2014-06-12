app.controller("sidebarCtrl", ["$scope", "$rootScope", "$state", "Page", "$q", "Options", "Utils", function($scope, $rootScope, $state, Page, $q, Options, Utils) {
	$rootScope.pages = GLOBALS.pages;
    $rootScope.colors = GLOBALS.colors;

 	$scope.hidden = [];
    $scope.bg_class = "default";

    $scope.views = [];

	$scope.refresh = Page.refreshPage;

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

    $scope.capitalize = function(txt) {
        return Utils.capitalize(txt, false, true);
    };

    $scope.viewClick = function(index) {
        Page.downloadView($scope.views[index].value);
    }
    
    $rootScope.$on("user", function(event, arg) {
        $scope.receiveOptions();
    });

    $rootScope.$on("sidebar-views", function(event, pages) {
        $scope.views = pages;
    });


    $scope.receiveOptions = function() {
        Options.getOption(Options.sidebarBackgroundTag, Options.sidebarHiddenTag).then(function(data) {
            $scope.bg_class = (data[Options.sidebarBackgroundTag]) ? data[Options.sidebarBackgroundTag] : "default";
            $scope.hidden = (data[Options.sidebarHiddenTag]) ? data[Options.sidebarHiddenTag] : [];

            $scope.init();
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