var app = angular.module("app", ["ui.router"]);

app.config(["$urlRouterProvider", "$stateProvider", function($urlRouterProvider, $stateProvider) {
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
}]).run(["$rootScope", "$q", function($rootScope, $q) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if(typeof $rootScope.canceler !== "undefined") {
            $rootScope.canceler.resolve();
        }
        $rootScope.canceler = $q.defer();
        $rootScope.loaded = false;
        
    });  
}]);



