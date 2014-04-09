app.factory("Window", ["$rootScope", function($rootScope) {   
    var nw = require("nw.gui");
    
    return {
        nw: nw,
        getWindow: function(url, arg) {
            if(url) { 
                arg = (!arg) ? {} : arg;
                return nw.Window.open("app://skolar/"+url, arg); 
            }
            
            return nw.Window.get();
        },
        listen: function(event, callback, window) {
            if(!window) { window = nw.Window.get(); }

            window.on(event, function() {
                $rootScope.$apply(function() {

                    callback(window); 
                });
            });
        }
    };
}]);