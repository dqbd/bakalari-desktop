app.controller("windowCtrl", 
    ["$scope", "Window", function($scope, Window) {

    $scope.classes = "max";
    
    $scope.close = function() { Window.window.close(); };
    $scope.min = function() { Window.window.minimize(); };
    $scope.max = function() { 
        if($scope.classes == "max") {
            Window.window.maximize(); 
        } else {
            Window.window.restore(); 
        }
    };
    
    Window.listen("maximize", function() { $scope.classes = "restore"; });
    Window.listen("unmaximize", function() { $scope.classes = "max"; });
}]);