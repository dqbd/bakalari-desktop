app.factory('Users', ['Database', '$q', '$rootScope', function(Database, $q, $rootScope) {

	this.getCurrentUser = function() {
		return this.getUser(this.getCurrentUserID());
	}

	this.getCurrentUserID = function() {
		return parseInt(localStorage.currentUser);
	}

	this.setCurrentUser = function(id) {
		localStorage.currentUser = id;
	}
	
	this.getFirstID = function() {
		var deferred = $q.defer();

		Database.perform(function(db) {
			db.get("SELECT MIN(id) AS min FROM 'users'", function(err, result) {
				deferred.resolve(result.min);
			});
		});

		return deferred.promise;
	}

	this.getUser = function(id) {
		var deferred = $q.defer();

		Database.perform(function(db) {
			db.get("SELECT id, user, pass, url, name, title FROM 'users' WHERE id = ?", id, function(err, result) {
				deferred.resolve(result);
			});
		});	

		return deferred.promise;
	}

	this.removeUser = function(id) {
		var deferred = $q.defer();

		Database.perform(function(db) {
			db.run("DELETE FROM 'users' WHERE id = ?", id, function(err) {
				deferred.resolve(this.changes);
			});
		});	

		return deferred.promise;
	}

	this.insertUser = function(user, callback) {
		var deferred = $q.defer();
		var query = user.user + "', '" + user.pass + "', '" + user.url + "', '" + user.name + "', '" +user.title;


		Database.perform(function(db) {

            db.run("INSERT INTO 'users' (user, pass, url, name, title) VALUES ('"+query+"')", function(err) {
            	$rootScope.$apply(function() {

            		if(err != null) {
            			deferred.reject(err);
            		} else {
            			deferred.resolve(this.lastID);
            		}
        		});
            });
        });

        return deferred.promise;
	}

	this.getUsers = function() {
		var deferred = $q.defer();

		Database.perform(function(db) {
			db.all("SELECT * FROM 'users'", function(err, result) {
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