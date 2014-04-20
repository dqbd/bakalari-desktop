app.factory('Users', ['Database', '$q', '$rootScope', function(Database, $q, $rootScope){
	return {
		getCurrentUser: function() {
			return this.getUser(parseInt(localStorage.currentUser));
		},
		setCurrentUser: function(id) {
			localStorage.currentUser = id;
		},

		getFirstID: function() {
			var deferred = $q.defer();

			Database.perform(function(db) {
				db.get("SELECT MIN(id) AS min FROM 'users'", function(err, result) {
					deferred.resolve(result);
				});
			});


			return deferred.promise;
		},
		getUser: function(id) {
			var deferred = $q.defer();

			Database.perform(function(db) {
				db.get("SELECT id, user, pass, url, name, title FROM 'users' WHERE id = ?", id, function(err, result) {
					deferred.resolve(result);
				});
			});	

			return deferred.promise;
		},
		insertUser: function(user, callback) {
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
		},
		getUsers: function() {
			var deferred = $q.defer();

			Database.perform(function(db) {
				db.all("SELECT * FROM 'users'", function(err, result) {
					$rootScope.$apply(function() {
						if(err != null) { 
							deferred.reject(err); 
						} else {
							deferred.resolve(result);
						} 
					});
				});
			});

			return deferred.promise;
		},
		createObject: function(id, user, pass, url, name, title) {


			return {
				"id": id,
				"user": user,
				"pass": pass,
				"url": url,
				"name": name,
				"title": title
			};
		},
	};	
}])