app.controller("znamkyCtrl", ["$scope", "$rootScope", "Parser", "Utils", function($scope, $rootScope, Parser, Utils) {
    // "980306r", "7dm3q2cu"
    

    $rootScope.$on("reload", function() {
        Parser.get("znamky").then(function(d) {
            $rootScope.loaded = true;
            $scope.data = d.data.data;
        });
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
    
    $scope.assignIcon = Utils.subjectToColor;
    $scope.shorten = Utils.shortenSubject;
}]);
        