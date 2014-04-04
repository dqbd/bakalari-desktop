var app = angular.module("app", ["ui.router", "angles"]);

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

    $stateProvider.state("vysvedceni", {
        url: "/vysvedceni",
        templateUrl: "assets/templates/vysvedceni.html",
        controller: "vysvedceniCtrl"
    }); 
}]);

app.run(["$rootScope", "$q", function($rootScope, $q) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if(typeof $rootScope.canceler !== "undefined") {
            $rootScope.canceler.resolve();
        }
        $rootScope.canceler = $q.defer();
        $rootScope.loaded = false;
        
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
