var app = angular.module("app.newuser", ['google-maps']);

app.config(["$httpProvider", function($httpProvider) {
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


app.controller('pageCtrl', ["$scope", "$location", "$rootScope", "Window", "$q", function ($scope, $location, $rootScope, Window, $q) {
	$scope.visible = function(page) {
		return ((page.length == 0 && $location.path().length == 0) || (("/"+page) == $location.path()));
	}

	$rootScope.$watch(function() { 
  		return $location.path(); 
    }, function(a){  
    	if(typeof $rootScope.canceler !== "undefined") {
            $rootScope.canceler.resolve();
        }
        $rootScope.canceler = $q.defer();

		$rootScope.$broadcast("url", $location.path());

		
		//$rootScope.$broadcast("url", "/adduser");
    });


    Window.getWindow().show();

}]);



app.controller('editorCtrl', ['$scope', "$rootScope", "$http", "$timeout", "$q", "Parser", function($scope, $rootScope, $http, $timeout, $q, Parser){
	$scope.canceler;
	$scope.currentSchool;
	$scope.data = [];

	$scope.isCurrent = function(item) {
		return ($scope.currentSchool && item.id == $scope.currentSchool.id);
	}

	$scope.setActive = function(school) {
		$scope.currentSchool = school;
		var latlng = new google.maps.LatLng(parseFloat(school.latitude), parseFloat(school.longitude));
		$scope.map.control.getGMap().panTo(latlng);
	}

	$scope.setSchool = function(school) {
		$rootScope.school = school;
	}

	$scope.downloadMarkers = function() {
		if($scope.map && $scope.map.bounds && Object.keys($scope.map.bounds).length > 0) {
			
			Parser.accessServer("map", {
				"topleft": $scope.map.bounds.northeast.latitude + "," + $scope.map.bounds.northeast.longitude,
				"bottomright": $scope.map.bounds.southwest.latitude + "," + $scope.map.bounds.southwest.longitude
			}).then(function(response) {	

				if(response.data.data != null && response.data.status != "error") {

					response.data.data.sort(function(x, y) {
						var x = parseFloat(x.distance), y = parseFloat(y.distance);
						return (x != y) ? ((x > y) ? -1 : 1) : 0;
					});

					$scope.data = response.data.data;

					var result = [];


					$scope.data.forEach(function(item) {
						var marker = {
							"latitude": item.latitude,
							"longitude": item.longitude,
							"title": item.name,
							"click": function () {
								$scope.setActive(item);
								$scope.$apply();
							}
						};
						result.push(marker);
					});




					$scope.map.markers = result;

				}
			});
		}
	}

	$scope.loadMarkers =  function() {
    	if(typeof $scope.canceler !== "undefined") {
			$timeout.cancel($scope.canceler);
        } 

        $scope.canceler = $timeout(function() {
        	$scope.downloadMarkers();
    	}, 100);
    }

	$rootScope.$on("url", function(event, path){
		delete $scope.map;
		delete $scope.data;
		delete $scope.currentSchool;

		
		if(path == "/map") {
			
			$http.get("https://maps.googleapis.com/maps/api/browserlocation/json?browser=chromium&sensor=true").then(function(d) {
				$scope.map = {
				    center: {
				        latitude: d.data.location.lat,
				        longitude: d.data.location.lng
				    },
				    control: {},
				    markers: [],
				    bounds: {},
				    options: {
				    	streetViewControl: false
				    },
				    events: {
		                idle: function() { $scope.loadMarkers(); }
				    },
				    zoom: 15
				};
			}, {timeout: $rootScope.canceler.promise});

		}
	})
}]);


app.controller('userCtrl', ["$scope", "$rootScope", "$location", "Parser", "Users", "Window", function($scope, $rootScope, $location, Parser, Users, Window){
	$scope.url = "";
	$scope.user = "";
	$scope.pass = "";

	$scope.school;


	$rootScope.$on("url", function(event, path){
		if(path == "/adduser") {
			var search = $location.search();

			if(Object.keys(search).length > 0 && search.url) {
				console.log(search.url);
				$scope.url = search.url;
			}

			$scope.school = $rootScope.school;

			if($scope.school != null) {
				$scope.url = $scope.school.url;
			}
		};
	});
	$scope.loading = false;


	$scope.send = function() {
		$scope.loading = true;
		Parser.getOnline("login", $scope.user, $scope.pass, $scope.url, null).then(function(data) {
			
			if(data.data.status == "ok") {
				console.log(Users.createObject(null, $scope.user, $scope.pass, $scope.url, data.data.data.name, data.data.data.type));
				Users.insertUser(Users.createObject(null, $scope.user, $scope.pass, $scope.url, data.data.data.name, data.data.data.type)).then(function() {
					Window.getWindow().close();
				});
				
			} else {
				if(data.data.data.short) {
					$scope.error = data.data.message;
				}
				
				$scope.loading = false;
			}
		});
	};
}]);