app.controller("windowCtrl", 
    ["$scope", "Window", function($scope, Window) {

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
    
    Window.listen("maximize", function() { $scope.classes = "restore"; });
    Window.listen("unmaximize", function() { $scope.classes = "max"; });
}]);