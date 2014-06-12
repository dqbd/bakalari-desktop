app.controller("vyukaCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {

    Page.registerPage("vyuka", function(data) {
        $scope.data = data;

        $scope.subjects = ($scope.subjects.length == 0 && $scope.data.views) ? $scope.data.views : $scope.subjects;
        $scope.pages = ($scope.pages.length == 0 && $scope.data.pages) ? $scope.data.pages : $scope.pages;
    });    

    $scope.pages = [];
    $scope.subjects = [];

    $scope.findLabel = function() {
        var temp = _.indexBy($scope.subjects, "value");
        var current = Page.getCurrentView();

        return (!(current in temp)) ? $scope.subjects[0] : temp[current];
    }
    
    $scope.subjects = [];
    $scope.pages = [];

    $scope.assignIcon = Utils.subjectToColor;

    $scope.shorten = Utils.shortenSubject;

}]);