app.factory("HttpService", ["$http", "$q", "$rootScope", function($http, $q, $rootScope) {
    var deferred, str = "";
    
    var options = {
        host: "http://localhost",
        path: ""
    };
    
    return {
        get: function(url, page, user, pass, arg) {
            //Pro agilní vývoj, používám pouze lokální kopie, nikoliv přístup na serveru
            // options.path = "/BakaParser/"+page+"?user="+user+"&pass="+pass+"&url="+url;

            if(page == "znamky") {
                options.path = "/BakaParser/"+page+"?file=klasifikace-pokrocily.html";
            } else if (page == "rozvrh") {
                options.path = "/BakaParser/"+page+"?file=rozvrh-novy-staly.htm";
            }



            var deferred = $http({method: 'GET', url: options.host+options.path, timeout: $rootScope.canceler.promise});

            return deferred;
        }
    };

}]);
