app.factory("Window", ["$rootScope", function($rootScope) {   
    var nw = require("nw.gui"), window = nw.Window.get();
    
    return {
        nw: nw,
        window: window,
        listen: function(event, callback) {
            window.on(event, function() {
               $rootScope.$apply(function() { callback(); });
            });
        }
    };
}]);