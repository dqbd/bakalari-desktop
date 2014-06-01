app.factory('Options', ['Database', 'Users', '$q', '$rootScope', function(Database, Users, $q, $rootScope){

	var callbacks = [];

	this.sidebarHiddenTag = "sidebarHidden";
	this.sidebarBackgroundTag = "sidebarBackground";

	this.registerObserver = function(callback) {
		callbacks.push(callback);
	};

	this.notifyObservers = function(data) {
		angular.forEach(callbacks, function(callback) {
			callback(data);
		});
	};

	
	this.getOption = function() {
		var deferred = $q.defer();
		var tags = _.values(arguments);

		Database.perform("options", function(db) {

			db.find({"key": {$in: tags}, "uid": Users.getCurrentUserID()}, function(err, result) {
				var ret = {};

				result.forEach(function(item) {
					ret[item.key] = item.value;
				})

				deferred.resolve(ret);
			});
		})

		return deferred.promise;
	}


	this.setOption = function(tag, change) {
		var deferred = $q.defer();
		var parent = this;

		var dataset = {"key": tag, "uid": Users.getCurrentUserID(), "value": change};

		Database.perform("options", function(db) {
			db.update(_.pick(dataset, "uid", "key"), dataset, {"upsert":true}, function(err) {

				$rootScope.$apply(function() {
					var notify = {}
					notify[tag] = change;

					parent.notifyObservers(notify);
				});
				
			});
		});

		return deferred.promise;
	}

	return this;
}]);