app.factory("Parser", ["$http", "$rootScope", "$q", "Database", "Users", function($http, $rootScope, $q, Database, Users) {    

    var host = "http://localhost";
    var caches = {
        "znamky": "klasifikace-pokrocily.html",
        "rozvrh": "rozvrh-novy-volno.htm",
        "suplovani": "suplovani-zaklad.htm",
        "akce": "plan.html",
        "predmety": "predmety.html",
        "absence": "absence.html",
        "vyuka": "vyuka.htm",
        "ukoly": "domaci-ukoly.html",
        "vysvedceni": "vysvedceni-znamky.htm"
    };

    var accessServer = function(page, args) { 
       return $http.post(host+"/BakaParser/"+page, args, {timeout: $rootScope.canceler.promise});
    };

    var getOnline = function(page, user, pass, url, arg) {
        return accessServer(page, {"url": url, "user": user, "pass":pass});
    };
    var getDebug = function(page) {
        var file = caches[page];
        return (file == null) ? null : accessServer(page, {"file": file});
    };

    var hasCache = function(page, arg) {

    };

    var get = function(page, arg) {
        var deferred = $q.defer();

    Database.perform(function(db) {

    });
        
        Users.getCurrentUser().then(function(user) {
            //return deferred.resolve(getDebug(page));
            return deferred.resolve(getOnline(page, user.user, user.pass, user.url, arg));
        });
 
        return deferred.promise;
    };
   

    return {
        "accessServer": accessServer,
        "getOnline": getOnline,
        "getDebug": getDebug,
        "get": get
    };

}]);
