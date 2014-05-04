app.controller("vysvedceniCtrl", ["$scope", "$rootScope", "Page", function($scope, $rootScope, Page) {

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
        Page.get("vysvedceni", force, arg).then(function(data) {
	        $scope.data = data;
	    });
	}

    $scope.load(false, viewstate);

}]);