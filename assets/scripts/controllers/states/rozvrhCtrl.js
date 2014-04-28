app.controller("rozvrhCtrl", ["$scope", "$rootScope", "Parser", "Progress", function($scope, $rootScope, Parser, Progress) {
    
    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        Progress.showLoading();
        $scope.load(arg.force);
    });

    $scope.load = function(force) {
        Progress.showLoading();

        Parser.get("rozvrh", {"arg": 3}, force).then(function(d) {
            Progress.hideLoading();
            $scope.data = d.data.data;
        });
    }

    $scope.isDefined = function(day, n) {
    	return isNaN($scope.getNumber(day,n));
    }

    $scope.getNumber = function(day, n) {

    	for(var x = 0; x < $scope.data.rozvrh[day]["lessons"].length; x++) {
    		var item = $scope.data.rozvrh[day]["lessons"][x];

            if((typeof item.lesson == "object" && n >= item.lesson.begin && n <= (item.lesson.begin + item.lesson.length - 1)) || parseInt(item["lesson"]) == n) {
                return item;
            }
    		
    	}

    	return null;
    }

    $scope.getLessonClass = function(lesson) {
        var result = [lesson.type];

        if(lesson.content.length > 1) {
            result.push("multi");
        }

        return result;
    }
    
    $scope.getRange = function(day) {
        if($scope.data.rozvrh[day]["lessons"].length == 1 
            && typeof $scope.data.rozvrh[day]["lessons"][0].lesson == "object" 
            && $scope.data.rozvrh[day]["lessons"][0].lesson.begin == 0
            && $scope.data.rozvrh[day]["lessons"][0].lesson.length == $scope.data.casy.length) {
            return 1;
        } 

        return $scope.data.casy.length;
    }

    $scope.load();
}]);

