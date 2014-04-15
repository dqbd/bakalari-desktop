app.factory("Parser", ["$http", "$rootScope", "$q", "Database", "Users", function($http, $rootScope, $q, Database, Users) {    

    var host = "http://duong.cz";
    var caches = {
        "znamky": "klasifikace-pokrocily.html",
        "rozvrh": "rozvrh-novy-zmena.html",
        "suplovani": "suplovani-zaklad.html",
        "akce": "plan.html",
        "predmety": "predmety.html",
        "absence": "absence.html",
        "vyuka": "vyuka.html",
        "ukoly": "domaci-ukoly.html",
        "vysvedceni": "vysvedceni-znamky.html"
    };

    var accessServer = function(page, args) { 
       return $http.post(host+"/BakaParser/"+page, args, {timeout: $rootScope.canceler.promise});
    };

    var getOnline = function(page, user, pass, url, arg) {
        var obj = {"url": url, "user": user, "pass":pass};

        return accessServer(page, _.extend(obj, arg));
    };
    var getDebug = function(page) {
        var file = caches[page];
        return (file == null) ? null : accessServer(page, {"file": file});
    };

    var constructHash = function(page, user, arg) {
        return page + JSON.stringify(_.sortBy(_.values(_.extend(user, arg)), "length").join(""));
    }

    var writeIntoCache = function(page, user, arg, data) {
        Database.perform(function(db) {

            //remove previous references
            db.run("DELETE FROM 'data' WHERE uid = ? AND request = ?", [user.id, constructHash(page,user,arg)]);

            var query = [user.id, constructHash(page,user,arg), JSON.stringify(data.data), new Date().getTime()].join("', '");
            db.run("INSERT INTO 'data' (uid, request, response, updated) VALUES ('" + query + "')");
        });
    }


    var get = function(page, arg, force) {
        var deferred = $q.defer();
        
        console.log("Calling GET " + page);
        Users.getCurrentUser().then(function(user) {
            //return deferred.resolve(getDebug(page));
            
            Database.perform(function(db) {
                db.get("SELECT * FROM 'data' WHERE request = ? AND uid = ?", [constructHash(page, user, arg), user.id], function(err, result) {
                    
                    $rootScope.$apply(function() {

                        if(typeof result === "undefined" || result == null || force == true) {
                            console.log(" - has not data");

                            deferred.resolve(getOnline(page, user.user, user.pass, user.url, arg).then(function(data) {
                                writeIntoCache(page, user, arg, data);
                                return data;
                            }));
                        } else {
                            console.log(" - resolving has data");

                            deferred.resolve({"data" : JSON.parse(result.response)});
                        }
                    });
                });
            });      
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
