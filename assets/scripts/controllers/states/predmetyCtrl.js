app.controller("predmetyCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {
    
    var reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force, (arg.view) ? {"view" : arg.view} : {});
    });

    $scope.$on('$destroy', function() { reload_listener(); });

    $scope.load = function(force, arg) {
        Page.get("predmety", force, arg).then(function(data) {
            $scope.data = data;
            $scope.data["predmety"] = Utils.sortCzech($scope.data["predmety"], 0);
        });
    }

    $scope.shown = [];

    $scope.toggleItem = function(index) {
    	var key = $scope.shown.indexOf(index);
    	if(key > -1) {
    		$scope.shown.splice(key, 1);
    	} else {
    		$scope.shown.push(index);
    	}
    }

    $scope.assignIcon = Utils.subjectToColor;

    $scope.shorten = Utils.shortenSubject;

    $scope.isVisible = function(index) {
    	return ($scope.shown.indexOf(index) > -1) && ($scope.data.hlavicka.length > 2);
    }

    $scope.load();

}]);