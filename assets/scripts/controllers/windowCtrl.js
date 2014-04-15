app.controller("windowCtrl", 
    ["$scope", "$rootScope", "Window", function($scope, $rootScope, Window) {

    $scope.classes = "max";
    
    $scope.close = function() { Window.getWindow().close(); };
    $scope.min = function() { Window.getWindow().minimize(); };
    $scope.max = function() { 
        if($scope.classes == "max") {
            Window.getWindow().maximize(); 
        } else {
            Window.getWindow().restore(); 
        }
    };

    $scope.refresh = function() {
        console.log("broadcast from refresh_button");
        $rootScope.$broadcast("reload", {force: true});
    };
    
    Window.listen("maximize", function() { $scope.classes = "restore"; });
    Window.listen("unmaximize", function() { $scope.classes = "max"; });
}]);