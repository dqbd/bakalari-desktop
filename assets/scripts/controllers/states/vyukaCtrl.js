app.controller("vyukaCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    
    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });

    $scope.load = function(force) {
        $rootScope.loaded = false;

        Parser.get("vyuka", {}, force).then(function(d) {
            $rootScope.loaded = true;
            $scope.data = d.data.data;

            if($scope.currentSubject < 0) {
                $scope.subjects = $scope.data.predmety;
                $scope.pages = $scope.data.stranky;

                $scope.currentSubject = 0;
            }
        });
    }

    $scope.load();
    
    $scope.subjects = [];
    $scope.pages = [];
    $scope.currentSubject = -1;

    

    $scope.assignIcon = Utils.subjectToColor;

}]);