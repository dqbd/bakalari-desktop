app.controller("vyukaCtrl", ["$scope", "$rootScope", "Parser", "Utils", "Progress", function($scope, $rootScope, Parser, Utils, Progress) {
    
    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });

    $scope.load = function(force) {
        Progress.showLoading();

        Parser.get("vyuka", {}, force).then(function(d) {
            Progress.hideLoading();
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