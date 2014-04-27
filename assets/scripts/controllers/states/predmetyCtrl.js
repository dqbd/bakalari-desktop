app.controller("predmetyCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    
    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });
    
    
    $scope.load = function(force) {
        $rootScope.loaded = false;
        Parser.get("predmety", {}, force).then(function(d) {
            $rootScope.loaded = true;
            $scope.data = d.data.data;

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