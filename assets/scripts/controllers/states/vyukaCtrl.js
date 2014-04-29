app.controller("vyukaCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {
    
    var reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force, (arg.view) ? {"view" : arg.view} : {});
    });

    $scope.$on('$destroy', function() { reload_listener(); });

    $scope.load = function(force, arg) {
        Page.get("vyuka", force, arg).then(function(data) {
            $scope.data = data;

            if($scope.currentSubject < 0) {
                $scope.subjects = $scope.data.predmety;
                $scope.pages = $scope.data.stranky;

                $scope.currentSubject = 0;
            }
        });
    }
    
    $scope.subjects = [];
    $scope.pages = [];
    $scope.currentSubject = -1;

    $scope.assignIcon = Utils.subjectToColor;

    $scope.load();

}]);