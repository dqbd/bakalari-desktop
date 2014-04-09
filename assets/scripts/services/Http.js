app.factory("Http", ["$http", "$q", "$rootScope", function($http, $q, $rootScope) {    
    return {
       
        get: function(url, timeout) {
            if(timeout) {
                return $http({method: 'GET', url: url});
            } else {
                return $http({method: 'GET', url: url, timeout: timeout});
            }
            
        }, 
        post: function(url, data, timeout) {
            if(!data) {
                return this.get(url, timeout);
            }

            if(timeout) {
                return $http({method: 'POST', data: data, url: url});
            } else {
                return $http({method: 'POST', data: data, url: url, timeout: timeout});
            }
        }
    };
}]);
