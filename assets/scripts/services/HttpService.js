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
                // 
            } else if (page == "rozvrh") {
                options.path = "/BakaParser/"+page+"?file=rozvrh-novy-zmena.htm";
            } else if (page == "suplovani") {
                options.path = "/BakaParser/"+page+"?file=suplovani-zaklad.htm";
            } else if (page == "akce") {
                options.path = "/BakaParser/"+page+"?file=plan.html";
            } else if (page == "predmety") {
                options.path = "/BakaParser/"+page+"?file=predmety.html";
            } else if (page == "absence") {
                options.path = "/BakaParser/"+page+"?file=absence.html";
            } else if (page == "vyuka") {
                options.path = "/BakaParser/"+page+"?file=vyuka.htm";
            } else if (page == "ukoly") {
                options.path = "/BakaParser/"+page+"?file=domaci-ukoly.html";
            } else if (page == "vysvedceni") {
                options.path = "/BakaParser/"+page+"?file=vysvedceni-znamky.htm";
            }

            // options.path = "/BakaParser/"+page+"?user="+user+"&pass="+pass+"&url="+url;



            var deferred = $http({method: 'GET', url: options.host+options.path, timeout: $rootScope.canceler.promise});

            return deferred;
        }
    };

}]);
