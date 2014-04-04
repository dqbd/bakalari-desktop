app.controller("predmetyCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    //load data;
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "predmety", "971031r", "dfiypam4").then(function(d) {
        $rootScope.loaded = true;
        $scope.data = d.data.data;

        console.log($scope.data);
    });

    $scope.shown = [];
    
    $scope.toggleItem = function(index) {
    	var key = $scope.shown.indexOf(index);
    	if(key > -1) {
    		$scope.shown.splice(key, 1);
    	} else {
    		$scope.shown.push(index);
    	}
    }

    $scope.assignIcon = function(string) {
        hash = 0;
        for(var x = 0; x < string.length; x++) {
            hash = string.charCodeAt(x) + ((hash << 5) - hash);
        }

        var color = ((hash>>24)&0xFF).toString(16) +
            ((hash>>16)&0xFF).toString(16) +
            ((hash>>8)&0xFF).toString(16) +
            (hash&0xFF).toString(16);

        return {"background-color": "#"+color.substr(0, 6)};
        
    }

    $scope.shorten = function(name) {
    	var addIn = ["i", "y", "í", "ý"];
    	var exceptions = {"čjl": "Čj", "ehv":"Eh", "evv": "Ev"};

        var words = (name.charAt(0).toUpperCase() + name.slice(0)).split(" ");

        var shortened = "";
        if(words.length > 1) {
    		shortened = words.map(function(e) {
    			return (e.length > 1) ? e.charAt(0) : "";
    		}).join("");
        } else {
        	shortened = name.charAt(0);
        	if(addIn.indexOf(name.charAt(1)) > -1) {
        		shortened += name.charAt(1);
        	} else if (shortened == "C" && name.charAt(1) == "h") {
                shortened += "h";
            }
        }

        return (exceptions[shortened.toLowerCase()]) ? exceptions[shortened.toLowerCase()] : shortened;
    };

    $scope.isVisible = function(index) {
    	return ($scope.shown.indexOf(index) > -1) && ($scope.data.hlavicka.length > 2);
    }

}]);