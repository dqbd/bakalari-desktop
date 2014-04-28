app.factory('Options', ['Database', 'Users', '$q', '$rootScope', function(Database, Users, $q, $rootScope){

	var options_key = "EXTRA:$options";
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

	this.getOptions = function() {
		var deferred = $q.defer();

		Database.perform(function(db) {

			db.get("SELECT response FROM 'data' WHERE request = ? AND uid = ?", [options_key, Users.getCurrentUserID()], function(error, result) {
				if(error || result == null) {

					deferred.reject(error);
				} else {
					deferred.resolve(JSON.parse(result.response));
				}
			});
			
		});
		return deferred.promise;
	}

	this.setOptions = function(options) {
		var deferred = $q.defer();
		var parent = this;



		this.getOptions().then(function(data) {
			Database.perform(function(db) { //update

				db.run("UPDATE 'data' SET response = ? WHERE request = ? AND uid = ?", [JSON.stringify(options), options_key, Users.getCurrentUserID()], function(err) {
					if(err) {
						console.log(err);
					}


					deferred.resolve();
				});
			});
		}, function(error) {

			Database.perform(function(db) { //insert	
				console.log("meeeh");
				db.run("INSERT INTO 'data' (uid, request, response, updated) VALUES (?, ?, ?, ?)", [Users.getCurrentUserID(), options_key, options, 0], function(err) {
					if(err) {
						console.log(err);
					}

					deferred.resolve();
				});
			});
		}).then(function() {
			parent.notifyObservers(options);
		});


		
		return deferred.promise;
	}

	this.getOption = function(tag) {
		var deferred = $q.defer();

		this.getOptions().then(function(data) {

			if(data[tag] != null) {
				deferred.resolve(data[tag]);
			} else {
				deferred.resolve(null);
			}
		}, function() {
			deferred.resolve(null);
		});

		return deferred.promise;
	}

	this.setOption = function(tag, change) {
		var deferred = $q.defer();
		var parent = this;
		
		var func = function(data) {
			data = (data && typeof data === "object") ? data : {};
			data[tag] = change;

			parent.setOptions(data).then(function() {
				deferred.resolve(true);
			}, function(error) {
				deferred.reject(error);
			});
		}

		this.getOptions().then(func, func);

		return deferred.promise;
	}

	return this;
}]);