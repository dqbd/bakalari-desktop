var app = angular.module("app", ["ui.router", "angles"]);

app.config(["$urlRouterProvider", "$stateProvider", "$httpProvider", "$compileProvider", function($urlRouterProvider, $stateProvider, $httpProvider, $compileProvider) {
    // $urlRouterProvider.otherwise("/znamky");

    pages.forEach(function(item) {
        $stateProvider.state(item.name, {
            url: "/"+item.name,
            templateUrl: "assets/templates/"+item.name+".html",
            controller: item.name+"Ctrl"
        });
    });

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

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|app):/);
}]);

app.run(["$rootScope", "$q", "Users", "Window", "Progress", function($rootScope, $q, Users, Window, Progress) {
    Window.getWindow().hide();

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if(typeof $rootScope.canceler !== "undefined") {
            $rootScope.canceler.resolve();
        }

        //jelikož angularjs 
        if(typeof $rootScope.reload_listener !== "undefined") {
            $rootScope.reload_listener();
        }

        console.log("changing");
        
        $rootScope.canceler = $q.defer();
        
        Progress.showLoading();
    }); 

    if(process.platform === 'win32' && parseFloat(require('os').release(), 10) > 6.1) {
        Window.getWindow().setMaximumSize(screen.availWidth + 15, screen.availHeight + 14);
    }

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
                            Users.setCurrentUser(d.min);
                            $rootScope.$emit("reload", {user: true});

                            Window.getWindow().show();
                        });


                    }
                });

            }, Window.getWindow("newuser.html", new_win));
            
            
        } else {
            
            var loadFirstId = function() {
                Users.getFirstID().then(function(d) {
                    localStorage.currentUser = d.min;
                    $rootScope.$emit("reload", {user: true});
                });
            }

            if(localStorage.currentUser) {
                Users.getUser(localStorage.currentUser).then(function(d) {
                    if(d == null) { 
                        loadFirstId(); 
                    }

                    Window.getWindow().show();
                });
            } else {
                loadFirstId();
                Window.getWindow().show();
            }

           
            
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

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});