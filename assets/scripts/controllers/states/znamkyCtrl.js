app.controller("znamkyCtrl", ["$scope", "$rootScope", "$state", "Parser", "Utils", function($scope, $rootScope, $state, Parser, Utils) {
    // "980306r", "7dm3q2cu"
    
    $rootScope.reload_listener = $rootScope.$on("reload", function(event, arg) {
        $scope.load(arg.force);
    });

    $scope.load = function(force) {
        $rootScope.loaded = false;
        
        Parser.get("znamky", {}, force).then(function(d) {
            $rootScope.loaded = true;

            $scope.shown = [];

            $scope.data = $scope.sortData(d.data.data);      
        });
    };


    $scope.sortData = function(data) {
        var list = [];

        data.predmety.forEach(function(item, index) {
            var marks = $scope.sortMarks(data.znamky[index]);

            list.push({'name': data.predmety[index], 'marks': marks});
        });

        list = Utils.sortCzech(list, "name");


        list.forEach(function(item, index) {
            data.predmety[index] = item["name"];
            data.znamky[index] = item["marks"];
        });

        return data;
    }

    $scope.sortMarks = function(marks) {

        marks.sort(function(a,b) {

            var a_date = a["date"].split(".");
            a_date = new Date(a_date[2], a_date[1]-1, a_date[0]);

            var b_date = b["date"].split(".");
            b_date = new Date(b_date[2], b_date[1]-1, b_date[0]);

            return (a_date.getTime() - b_date.getTime()) * -1;
        });

        marks.forEach(function(mark) {
            if(mark.caption.length <= 0 && mark.note.length > 0) { //pokud z nějakého důvodu učitel zapisuje do poznámek, místo detailů, tak to překopírujeme
                mark.caption = mark.note;
            }
        });

        return marks;

    }
    
    $scope.load();

    $scope.shown = [];
    
    $scope.toggleItem = function(index) {
    	var key = $scope.shown.indexOf(index);
    	if(key > -1) {
    		$scope.shown.splice(key, 1);
    	} else {
    		$scope.shown.push(index);
    	}
    }
   
    $scope.isPoint = function(mark) {

        return (typeof mark === "object");
    }

    $scope.isPointSystem = function(subject) {
        var result = false;
        subject.forEach(function(mark) {
            if($scope.isPoint(mark.mark)) {
                result = true;
                return;
            }
        });
        return result;
    }


    $scope.calculateAverage = function(subject) {
    	var avg = sum = max = 0;

        var isPointSystem = $scope.isPointSystem(subject);

		subject.forEach(function(mark) {

            var weight = (!isNaN(parseInt(mark.weight))) ? parseInt(mark.weight) : 1;

            if($scope.isPoint(mark.mark)) {
                var gain = $scope.isNumericMark(mark.mark.gain);
                var max = $scope.isNumericMark(mark.mark.max);



                if(value != false) {
                    avg += gain * weight;
                    sum += max * weight;
                }  

            } else {
                var value = $scope.isNumericMark(mark.mark);

                if(value != false) {
                    avg += value * weight;
                    sum += weight;
                }  
            }
            
		})


		return (isPointSystem) ? ((avg / sum)*100).toFixed(2)  + "%" : (avg / sum).toFixed(2);
    }

    $scope.isNumericMark = function(mark) {
        if(isFinite(mark) && !isNaN(parseFloat(mark))) {
            return parseInt(mark) ;
        } else {
            if(mark.length == 2 && _.contains(["+", "-", "!"], mark[1]) && !isNaN(parseFloat(mark[0]))) {
                return (parseInt(mark[0]) + ((mark[1] == "+") ? -0.5 : 0.5));
            } else {
                return false;
            }
        }
    }

    $scope.getAverageColor = function(subject) {
        var average = $scope.calculateAverage(subject);
        var rounded;

        if($scope.isPointSystem(subject)) {
            average = Math.round(parseFloat(average.substring(0, average.length-1)));
            
            if(average > 85) {
                rounded = "1";
            } else if (average <= 85 && average > 70) {
                rounded = "2";
            } else if (average <= 70 && average > 50) {
                rounded = "3";
            } else if (average <= 50 && average > 30) {
                rounded = "4";
            } else if (average <= 30) {
                rounded = "5";
            }
            
            

        } else {
            rounded = Math.round($scope.calculateAverage(subject)).toString();
        }


    	return "avg-"+rounded;
    }

    $scope.isVisible = function(index) {
    	return $scope.shown.indexOf(index) > -1;
    }
    
    $scope.assignIcon = Utils.subjectToColor;
    $scope.shorten = Utils.shortenSubject;


}]);
        