app.factory("Window", ["$rootScope", function($rootScope) {   
    this.nw = require("nw.gui");

    
    this.getWindow = function(url, arg) {
        if(url) { 
            arg = (!arg) ? {} : arg;
            return this.nw.Window.open("app://skolar/"+url, arg); 
        }
        
        return this.nw.Window.get();
    }

    this.listen = function(event, callback, window) {
        if(!window) { window = this.nw.Window.get(); }

        window.on(event, function() {
            $rootScope.$apply(function() {

                callback(window); 
            });
        });
    }

    return this;
}]);