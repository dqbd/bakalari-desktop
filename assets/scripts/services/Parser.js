app.factory("Parser", ["$http", "$rootScope", "$q", "Database", "Users", "Error", function($http, $rootScope, $q, Database, Users, Error) {    

    var host = "duong.cz";
    var domain = "http://"+host;
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
       return $http.post(domain+"/BakaParser/"+page, args, {timeout: $rootScope.canceler.promise});
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

            db.run("INSERT INTO 'data' (uid, request, response, updated) VALUES (?, ?, ?, ?)",
                [user.id, constructHash(page,user,arg), JSON.stringify(data.data), new Date().getTime()]
            );
        });
    }

    var isConnected = function(revert) {
        var deferred = $q.defer();
        require('dns').lookup("www.google.com", function(err) {
            
            deferred.resolve((err == null));
        });

        return deferred.promise;
    }

    var hasCache = function(page, user, arg, force) {
        var deferred = $q.defer();

        var callback = function(err, result) {
            if(result == null || force == true) {
                deferred.reject(result);
            } else {
                deferred.resolve(result);
            }
        }

        isConnected().then(function(connected) {
            
            if(user == null) {

                deferred.reject(false);
            } else {
                Database.perform(function(db) {
                    if(connected == true) {
                        db.get("SELECT * FROM 'data' WHERE request = ? AND uid = ? AND updated >= ?", 
                            [constructHash(page, user, arg), user.id, new Date().getTime() - (60 * 60 * 1000)], callback);
                    } else {
                        db.get("SELECT * FROM 'data' WHERE request = ? AND uid = ?", 
                            [constructHash(page, user, arg), user.id], callback);
                    }
                });
            }
        });

        return deferred.promise;
    }

    


    var get = function(page, arg, force) {
        var deferred = $q.defer();

        var result = $q.defer();
        
        Error.hideError();

        $q.all({"user": Users.getCurrentUser(), "connected": isConnected()}).then(function(status) {
            var user = status.user;
            hasCache(page, user, arg, force).then(
                function(data) { //máme cache 
                    Error.hideError();
                    deferred.resolve({"data" : JSON.parse(data.response)});
                }, function(data) { //nemáme cache 
                    if(data != false) {
                        if(status.connected == false) { //nemá smysl stahovat, vyhoď rovnou chybu
                            Error.showError("Nejsme připojeni", "sad");

                            deferred.reject(null);
                            console.log("error");
                        } else { //hm... zkusme to stáhnout
                            console.log("dling");
                            var promise = getOnline(page, user.user, user.pass, user.url, arg).then(function(data) {
                                writeIntoCache(page, user, arg, data);
                                return data;
                            });

                            promise.then(function(data) { //data
                                deferred.resolve(data);
                            }, function(error) { //serverová chyba
                                Error.showError("Chyba na straně serveru!");
                                deferred.reject(data);
                            });
                        }
                    } else {
                        deferred.reject(data);
                    }
                }
            );    
        });

        deferred.promise.then(function(data) {
            if(_.isEmpty(data) || _.isEmpty(data.data) || _.isEmpty(data.data.data[page])) {
                Error.showError("Nemáme k dispozici žádné data", "sad");
                result.reject(data);
            } else {
                Error.hideError();
                result.resolve(data);
            }
            
        }, function(error) {
            result.reject(error);
        });
 
        return result.promise;
    };
   
    return {
        "accessServer": accessServer,
        "getOnline": getOnline,
        "getDebug": getDebug,
        "get": get
    };
}]);
