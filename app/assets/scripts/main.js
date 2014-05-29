var app = angular.module("app", ["ui.router", "angles", "ngAnimate"]);

app.config(["$urlRouterProvider", "$stateProvider", "$httpProvider", "$compileProvider", function($urlRouterProvider, $stateProvider, $httpProvider, $compileProvider) {
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

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|mailto|app):/);
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

app.directive('ngRightClick', ["$parse", function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
}]);

app.run(["$rootScope", "$q", "Users", "Window", "Progress", "Notifications", function($rootScope, $q, Users, Window, Progress, Notifications) {
    Window.getWindow().hide();

    $rootScope.window_title = "Školář";

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if(typeof $rootScope.canceler !== "undefined") {
            $rootScope.canceler.resolve();
        }

        $rootScope.window_title = _.findWhere(pages, {"name": toState.name}).title + " - Školář";
        
        $rootScope.canceler = $q.defer();

        $rootScope.$emit("sidebar-views", []);
        
        Progress.showLoading();
    }); 

    Users.getCurrentUser().then(function(current) {
        if(current == null) {
            Users.getFirstID().then(function(fid) {
                if(fid == null) {
                    var popup = Window.getWindow("newuser.html", new_win);
                    popup.requestAttention(true);

                    Window.listen("closed", function(window) {
                        Users.getUsers().then(function(data) {
                            if(data.length <= 0) { //still no user, ok.. closing
                                Window.getWindow().close();
                            } else { //new user, get it.
                                Users.setCurrentUser(_.min(_.pluck(data, 'id')));
                                $rootScope.$emit("user");

                                Window.getWindow().show();
                            }
                        });
                    }, popup);
                } else { //hey, there is a user!
                    Users.setCurrentUser(fid);
                    $rootScope.$emit("user");

                    Window.getWindow().show();
                }
            });
        } else {
            Window.getWindow().show();
        }
    });

    Notifications.display("booze", "meh")

    Window.listen("close", function(window) {
        Notifications.close(true);
        window.hide();

        //TODO: inicializuj update

        window.close(true);
    });

    //win8 maximalization hack
    if(process.platform === 'win32' && parseFloat(require('os').release(), 10) > 6.1) {
        Window.getWindow().setMaximumSize(screen.availWidth + 15, screen.availHeight + 14);
    }
}]);