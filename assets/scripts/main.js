var app = angular.module("app", ["ui.router", "angles"]);

app.config(["$urlRouterProvider", "$stateProvider", "$httpProvider", function($urlRouterProvider, $stateProvider, $httpProvider) {
    $urlRouterProvider.otherwise("/");


    $stateProvider.state("znamky", {
        url: "/",
        templateUrl: "assets/templates/znamky.html",
        controller: "znamkyCtrl"
    });

    $stateProvider.state("rozvrh", {
        url: "/rozvrh",
        templateUrl: "assets/templates/rozvrh.html",
        controller: "rozvrhCtrl"
    });
    $stateProvider.state("suplovani", {
        url: "/suplovani",
        templateUrl: "assets/templates/suplovani.html",
        controller: "suplovaniCtrl"
    }); 

    $stateProvider.state("plan", {
        url: "/plan",
        templateUrl: "assets/templates/plan.html",
        controller: "planCtrl"
    }); 

    $stateProvider.state("predmety", {
        url: "/predmety",
        templateUrl: "assets/templates/predmety.html",
        controller: "predmetyCtrl"
    }); 

    $stateProvider.state("vyuka", {
        url: "/vyuka",
        templateUrl: "assets/templates/vyuka.html",
        controller: "vyukaCtrl"
    }); 

    $stateProvider.state("absence", {
        url: "/absence",
        templateUrl: "assets/templates/absence.html",
        controller: "absenceCtrl"
    }); 

    $stateProvider.state("ukoly", {
        url: "/ukoly",
        templateUrl: "assets/templates/ukoly.html",
        controller: "ukolyCtrl"
    }); 

    // $stateProvider.state("vysvedceni", {
    //     url: "/vysvedceni",
    //     templateUrl: "assets/templates/vysvedceni.html",
    //     controller: "vysvedceniCtrl"
    // }); 
    
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    
    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
        
        for(name in obj) {
            value = obj[name];
        
            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null) {
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };
 
    
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
}]);

app.run(["$rootScope", "$q", "Users", "Window", function($rootScope, $q, Users, Window) {


    $rootScope.$on("reload", function() {
        if(typeof $rootScope.canceler !== "undefined") {
            $rootScope.canceler.resolve();
        }
        $rootScope.canceler = $q.defer();
        $rootScope.loaded = false;
    }); 

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        $rootScope.$broadcast("reload", false);
    }); 



    Users.getUsers().then(function(d) {
        if(d.length <= 0) {
            Window.getWindow().hide();
            Window.listen("closed", function(window) {
                

                //už je tam nějaký účet?
                Users.getUsers().then(function(d) {
                    if(d.length <= 0) { //ne, boo.
                        Window.getWindow().close(true);
                    } else {
                        Users.getFirstID().then(function(d) {
                            localStorage.currentUser = d.min;
                             $rootScope.$broadcast("reload", true);

                            Window.getWindow().show();
                        });


                    }
                });

                
            }, Window.getWindow("newuser.html", {
                "frame":true, "toolbar":false, "width": 800, "height": 500, "min_width": 800, "min_height": 500, "max_width": 800, "max_height": 500, "focus": true, "show": false
            }));
            
            
        } else {
            
            var loadFirstId = function() {
                Users.getFirstID().then(function(d) {
                    localStorage.currentUser = d.min;
                    $rootScope.$broadcast("reload", true);
                });
            }

            if(localStorage.currentUser) {
                Users.getUser(localStorage.currentUser).then(function(d) {
                    if(d == null) { loadFirstId(); }
                });
            } else {
                loadFirstId();
            }

            Window.getWindow().show();

            $rootScope.$broadcast("reload", false);
        }
    });
}]);

app.filter('range', function() {
    return function(input) {
        var lowBound, highBound;
        switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0]) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0]);
                highBound = parseInt(input[1]);
                break;
            default:
                return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++) {
            result.push(i);
        }

        return result;
    };
});
