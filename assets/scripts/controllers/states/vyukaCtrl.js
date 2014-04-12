app.controller("vyukaCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    //load data;
    //
    
    $rootScope.$on("reload", function() {
        $rootScope.loaded = false;
        $scope.load();
    });

    

    $scope.load = function() {
      Parser.get("vyuka").then(function(d) {
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