app.controller("znamkyCtrl", ["$scope", "$rootScope", "HttpService", function($scope, $rootScope, HttpService) {
    
    HttpService.get("http://intranet.wigym.cz:6040/bakaweb/", "znamky", "980306r", "7dm3q2cu").then(function(d) {
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

    // $scope.colors = ["#9B59B6", "#3498DB", "#E74C3C", "#F39C12", "#27AE60", "#2980B9"];
    // $scope.assignIcon = function(name) {
    // 	var hash = 0;
    // 	for(var x = 0; x < name.length; x++) {
    // 		num = name.charCodeAt(x);
    // 		hash += ((hash << 10) - hash) + num;
    // 		hash = hash & hash;

    		
    // 	}
    // 	return {"background-color": $scope.colors[(hash % $scope.colors.length)]};
    // }
    // 
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

    $scope.calculateAverage = function(subject) {
    	var avg = 0;
    	var sum = subject.length; 

        
	

		subject.forEach(function(mark) {
			if(!isNaN(parseFloat(mark.mark)) && isFinite(mark.mark)) {
				avg += parseInt(mark.mark);
			} else {
				sum--; 
			};
		})

		return (avg / sum).toFixed(2);
    }

    $scope.getAverageColor = function(subject) {
    	return "avg-"+Math.round($scope.calculateAverage(subject)).toString();
    }

    $scope.isVisible = function(index) {
    	return $scope.shown.indexOf(index) > -1;
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
}]);
        