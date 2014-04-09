app.controller("vyukaCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    //load data;
    
    $scope.subjects = [];
    $scope.pages = [];
    $scope.currentSubject = -1;

    Parser.get("vyuka").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;

        

      	if($scope.currentSubject < 0) {
      		$scope.subjects = $scope.data.predmety;
      		$scope.pages = $scope.data.stranky;

      		$scope.currentSubject = 0;
      	}
    });

    $scope.assignIcon = Utils.subjectToColor;

}]);