app.factory('Users', ['Database', '$q', '$rootScope', function(Database, $q, $rootScope) {

	this.getCurrentUser = function() {
		return this.getUser(this.getCurrentUserID());
	}

	this.getCurrentUserID = function() {
		return localStorage.currentUser;
	}

	this.setCurrentUser = function(id) {
		localStorage.currentUser = id;
	}
	
	this.getFirstID = function() {
		var deferred = $q.defer();

		Database.perform("users", function(db) {
			db.findOne({}, function(err, result) {

				deferred.resolve((result != null) ? result._id : null);
			});
		});

		return deferred.promise;
	}

	this.getUser = function(id) {
		var deferred = $q.defer();

		Database.perform("users", function(db) {

			db.findOne({"_id": id}, function(err, result) {
				deferred.resolve(result);
			});
			// db.get("SELECT id, user, pass, url, name, title FROM 'users' WHERE id = ?", id, function(err, result) {
			// 	deferred.resolve(result);
			// });
		});	

		return deferred.promise;
	}

	this.removeUser = function(id) {
		var deferred = $q.defer();

		Database.perform(function(db) {
			db.remove({"_id": id}, {}, function(err, removed) {
				deferred.resolve(removed);
			});
		});	

		return deferred.promise;
	}

	this.insertUser = function(user) {
		var deferred = $q.defer();

		user = _.omit(user, "id");

		Database.perform("users", function(db) {
			db.insert(user, function(err, result) {

				$rootScope.$apply(function() {
					if(err != null) {
						console.log(err);
						deferred.reject(err);
					} else {
						deferred.resolve(result._id);
					}

				});

			});
        });

        return deferred.promise;
	}

	this.getUsers = function() {
		var deferred = $q.defer();

		Database.perform('users', function(db) {
			db.find({}, function(err, result) {
				if(err != null) { 
					deferred.reject(err); 
				} else {
					deferred.resolve(result);
				} 
			});
		});

		return deferred.promise;
	}

	this.createObject = function(id, user, pass, url, name, title) {
		return {
			"id": id,
			"user": user,
			"pass": pass,
			"url": url,
			"name": name,
			"title": title
		};
	}
	
	return this;
}])