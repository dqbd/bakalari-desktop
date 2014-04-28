app.factory("Parser", ["$http", "$rootScope", "$q", "Database", "Users", "Progress", "Options", function($http, $rootScope, $q, Database, Users, Progress, Options) {    

    var host = "localhost";
    var domain = "http://"+host;
    var caches = {
        "znamky": "klasifikace-body.html",
        "rozvrh": "rozvrh-novy-zmena.html",
        "suplovani": "suplovani-zaklad.html",
        "akce": "plan.html",
        "predmety": "predmety.html",
        "absence": "absence.html",
        "vyuka": "vyuka.html",
        "ukoly": "domaci-ukoly.html",
        "vysvedceni": "vysvedceni-znamky.html"
    };

    var parent = this;

    this.accessServer = function(page, args) { 
       return $http.post(domain+"/BakaParser/"+page, args, {timeout: $rootScope.canceler.promise});
    };

    this.getOnline = function(page, user, pass, url, arg) {
        var obj = {"url": url, "user": user, "pass":pass};

        return this.accessServer(page, _.extend(obj, arg));
    };
    this.getDebug = function(page) {
        var file = caches[page];
        return (file == null) ? null : this.accessServer(page, {"file": file});
    };

    this.constructHash = function(page, user, arg) {
        return page + JSON.stringify(_.sortBy(_.values(_.extend(user, arg)), "length").join(""));
    }

    this.writeIntoCache = function(page, user, arg, data) {
        

        Database.perform(function(db) {
            //remove previous references
            //TODO: Update by bylo lepší
            db.run("DELETE FROM 'data' WHERE uid = ? AND request = ?", [user.id, parent.constructHash(page,user,arg)]);

            db.run("INSERT INTO 'data' (uid, request, response, updated) VALUES (?, ?, ?, ?)",
                [user.id, parent.constructHash(page,user,arg), JSON.stringify(data.data), new Date().getTime()]
            );
        });
    }

    this.isConnected = function(revert) {
        var deferred = $q.defer();
        require('dns').lookup("www.google.com", function(err) {
            
            deferred.resolve((err == null));
        });

        return deferred.promise;
    }

    this.hasCache = function(page, user, arg, force) {
        var deferred = $q.defer();

        var callback = function(err, result) {
            if(result == null || force == true) {
                deferred.reject(result);
            } else {
                deferred.resolve(result);
            }
        }

        this.isConnected().then(function(connected) {
            if(user == null) {
                deferred.reject(false);
            } else {
                Database.perform(function(db) {
                    if(connected == true) {
                        db.get("SELECT * FROM 'data' WHERE request = ? AND uid = ? AND updated >= ?", 
                            [parent.constructHash(page, user, arg), user.id, new Date().getTime() - (60 * 60 * 1000)], callback);
                    } else {
                        db.get("SELECT * FROM 'data' WHERE request = ? AND uid = ?", 
                            [parent.constructHash(page, user, arg), user.id], callback);
                    }
                });
            }
        });

        return deferred.promise;
    }
    
    this.get = function(page, arg, force) {
        var deferred = $q.defer();

        var result = $q.defer();
        
        Progress.hideError();

        //return getDebug(page);

        $q.all({"user": Users.getCurrentUser(), "connected": this.isConnected()}).then(function(status) {
            var user = status.user;
            parent.hasCache(page, user, arg, force).then(
                function(data) { //máme cache 
                    deferred.resolve({"data" : JSON.parse(data.response)});
                }, function(data) { //nemáme cache 
                    if(data != false) {
                        if(status.connected == false) { //nemá smysl stahovat, vyhoď rovnou chybu
                            Progress.showError("Nejsme připojeni", "sad");

                            deferred.reject(null);
                        } else { //hm... zkusme to stáhnout
                            var promise = parent.getOnline(page, user.user, user.pass, user.url, arg).then(function(data) {
                                parent.writeIntoCache(page, user, arg, data);
                                return data;
                            });

                            promise.then(function(data) { //data
                                deferred.resolve(data);
                            }, function(error) { //serverová chyba
                                Progress.showError("Chyba na straně serveru!");
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
            if(_.isEmpty(data) || _.isEmpty(data.data)) {
                Progress.showError("Nemáme k dispozici žádné data", "sad");
                result.reject(data);
            } else {
                if(data.data.status != "ok") {
                    if(data.data.message == "Neexistující požadavek") {
                        Progress.showError("Tato stránka neexistuje na Bakalářích (nebo nefunguje)", "sad", "Pokud to tam má být, zkus aktualizovat");
                        result.reject(data);
                    } else {
                        Progress.showError("Chyba na straně serveru", "error", data.data.message);
                        result.reject(data);
                    }
                } else if (data.data.data == null || _.isEmpty(data.data.data[page])) {
                    Progress.showError("Nemáme k dispozici žádné data", "sad", "Je možné, že nic není nového :)");
                    result.reject(data);
                } else {
                    Progress.hideError();
                    result.resolve(data);
                }
            }
        }, function(error) {
            result.reject(error);
        });
 
        return result.promise;
    };
   
    return this;
}]);
