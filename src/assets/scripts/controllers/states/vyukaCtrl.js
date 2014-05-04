app.controller("vyukaCtrl", ["$scope", "$rootScope", "Page", "Utils", function($scope, $rootScope, Page, Utils) {
    
    var viewstate = {}, reload_listener = $rootScope.$on("reload", function(event, arg) {
        arg = (arg) ? arg : {};

        viewstate = (arg.view != null) ? 
            ((arg.view != false) ? {"view": arg.view} : {}) : 
            ((!_.isEmpty(viewstate)) ? viewstate : {});

        $scope.load(arg.force, viewstate);
    });

    $scope.pages = [];
    $scope.subjects = [];

    $scope.$on('$destroy', function() { 
        reload_listener(); 
        viewstate = {};
    });

    $scope.load = function(force, arg) {
        Page.get("vyuka", force, arg).then(function(data) {
            $scope.data = data;

            $scope.subjects = ($scope.subjects.length == 0 && $scope.data.views) ? $scope.data.views : $scope.subjects;
            $scope.pages = ($scope.pages.length == 0 && $scope.data.pages) ? $scope.data.pages : $scope.pages;
        });
    }

    $scope.findLabel = function() {
        var temp = _.indexBy($scope.subjects, "value");


        if(_.isEmpty(viewstate) || !(viewstate.view in temp)) {
            return $scope.subjects[0];
        } else {
            return temp[viewstate.view];
        }
    }
    
    $scope.subjects = [];
    $scope.pages = [];

    $scope.assignIcon = Utils.subjectToColor;

    $scope.shorten = Utils.shortenSubject;

    $scope.load(false, viewstate);

}]);