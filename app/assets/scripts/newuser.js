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

        $rootScope.loaded = true;

		$rootScope.$emit("url", $location.path());
    });

    Window.getWindow().show();
}]);



app.controller('editorCtrl', ['$scope', "$rootScope", "$http", "$timeout", "$q", "Parser", function($scope, $rootScope, $http, $timeout, $q, Parser){
	$scope.canceler = $scope.currentSchool = $scope.activeMarkers;
	$scope.markers = [];

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

	$scope.renderMarkers = function(polygon) {
		$scope.map.markers = _.filter($scope.markers, function(item) {
			return geolib.isPointInside(_.pick(item, 'latitude', 'longitude'), polygon);
		});

		$scope.activeMarkers = $scope.sortByDistance($scope.map.markers, polygon);
	}

	$scope.constructPolygon = function(tx, ty, bx, by) {
		return [{"latitude": tx, "longitude": ty}, {"latitude": bx, "longitude": ty}, {"latitude": bx, "longitude": by}, {"latitude": tx, "longitude": by}];
	}

	$scope.sortByDistance = function(markers, polygon) {
		var markers = _.indexBy(markers, 'id');

		return _.map(geolib.orderByDistance(geolib.getCenter(polygon), markers), function(value) {
			return _.extend(markers[value.key], value);
		});
	}

	$scope.downloadMarkers = function(polygon) {
		Parser.accessServer("map", {
			"topleft": _.values(polygon[0]).join(),
			"bottomright": _.values(polygon[2]).join()
		}).then(function(response) {	

			if(response.data.data != null && response.data.status != "error") {
				response.markers = [];
				response.data.data.forEach(function(item) {
					response.markers.push(_.extend(item, {
						"title": item.name,
						"click": function () {
							$scope.setActive(item);
							$scope.$apply();
						}
					}));
				});

				$scope.markers = _.uniq(_.union($scope.markers, response.markers), false, function(item, key, a){ return item.title; });

				$scope.renderMarkers(polygon);
			}
		});
	}

	$scope.loadMarkers =  function() {
    	if(typeof $rootScope.canceler !== "undefined") {
    		$timeout.cancel($scope.canceler);
    		$rootScope.canceler.resolve();
        }

        $scope.canceler = $timeout(function() {
        	if($scope.map !== undefined && _.isEmpty($scope.map.bounds) == false) {
				var polygon = $scope.constructPolygon(
					$scope.map.bounds.northeast.latitude, 
					$scope.map.bounds.northeast.longitude, 
					$scope.map.bounds.southwest.latitude, 
					$scope.map.bounds.southwest.longitude
				);

				$scope.renderMarkers(polygon);

		        $rootScope.canceler = $q.defer(); 
		        $scope.downloadMarkers(polygon);
	        }
        }, 0);
    }

	$rootScope.$on("url", function(event, path){
		delete $scope.map;
		delete $scope.currentSchool;
		delete $scope.activeMarkers;

		
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
				$scope.url = search.url;
			}

			$scope.school = $rootScope.school;

			if($scope.school != null) {
				$scope.url = $scope.school.url;
			}
		};
	});
	$scope.loading = false;

	$scope.remove = function() {
		$scope.school = $rootScope.school = null;
	}

	$scope.send = function() {
		$scope.loading = true;

		Parser.getOnline("login", $scope.user, $scope.pass, $scope.url, null).then(function(data) {
			
			if(data.data.status == "ok") {
				Users.insertUser(Users.createObject(null, $scope.user, $scope.pass, $scope.url, data.data.data.name, data.data.data.type)).then(function() {
					Window.getWindow().close();
				});
				
			} else {
				$scope.error = (data.data.data && data.data.data.short) ? data.data.data.short : data.data.message;

				$scope.loading = false;
			}
		});
	};
}]);