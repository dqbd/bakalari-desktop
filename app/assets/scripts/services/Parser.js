app.factory("Parser", ["$http", "$rootScope", "$q", "Database", "Users", "Progress", function($http, $rootScope, $q, Database, Users, Progress) {   

    var domain = "http://"+host;
    var caches = {
        "znamky": "klasifikace-body.html",
        "rozvrh": "rozvrh-novy-maturity.html",
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
            console.log(result);
            if(result == null || result.response == null || result.response.length <= 0 || force == true) {
                deferred.reject(result);
            } else {
                deferred.resolve(JSON.parse(result.response));
            }
        }

        this.isConnected().then(function(connected) {
            if(user == null) {
                deferred.reject(false);
            } else {
                Database.perform("cache", function(db) {
                    var time = new Date().getTime() - (60 * 60 * 1000);

                    if(connected == true) {
                        db.findOne({"request": parent.constructHash(page, user, arg), "uid": user._id, "updated": {$gte: time}}, callback);
                    } else {
                        db.findOne({"request": parent.constructHash(page, user, arg), "uid": user._id}, callback);
                    }
                });
            }
        });

        return deferred.promise;
    }

    this.writeIntoCache = function(page, user, arg, data) {
        Database.perform("cache", function(db) {            
            var dataset = _.object(
                ["uid", "request", "response", "updated"],
                [user._id, parent.constructHash(page,user,arg), JSON.stringify(data), new Date().getTime()]
            );

            db.update(_.pick(dataset, ["uid", "request"]), dataset, {"upsert": true});
        });
    }
    
    this.get = function(page, arg, force) {

        Progress.hideError();

        // return parent.getDebug(page).then(function(data) {
        //     // console.log(data.data);
            
        //     return data.data;
        // });

        return $q.all({"user": Users.getCurrentUser(), "connected": this.isConnected()}).then(function(status) {
            var user = status.user, deferred = $q.defer();

            parent.hasCache(page, user, arg, force).then(
                function(data) { //máme cache 
                    deferred.resolve(_.extend(data, {"cached": true}));
                }, function(data) { //nemáme cache 
                    if(data != false) {
                        if(status.connected == false) { //nemá smysl stahovat, vyhoď rovnou chybu
                            deferred.reject({"status":"error", "code": "no-connection"});
                        } else { //hm... zkusme to stáhnout
                            parent.getOnline(page, user.user, user.pass, user.url, arg).then(function(data) {
                                parent.writeIntoCache(page, user, arg, data.data);
                                return data;
                            }).then(function(data) { //data
                                deferred.resolve(_.extend(data.data, {"cached": false}));
                            }, function(error) { //serverová chyba
                                deferred.reject({"status": "error", "code": "server-error", "data": error});
                            });
                        }
                    } else {
                        deferred.reject({"status":"error", "code": "not-login"});
                    }
                }
            );    

            return deferred.promise;
            
        });
    };
   
    return this;
}]);
