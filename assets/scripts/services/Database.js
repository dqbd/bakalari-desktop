app.factory('Database', ['$rootScope', '$q', "Window", function($rootScope, $q, Window) {
	var sqlite = require("sqlite3").verbose();
	var fs = require("fs");

	var db_promise = $q.defer();

	var getDatabaseVersion = function() {
		var deferred = $q.defer();

		fs.readFile("package.json", "utf8", function(err, data) {
			if(err) { throw err; }

			data = JSON.parse(data);

		deferred.resolve(data["database-version"]);
		});

		return deferred.promise;
	}

	//inicializovat
	getDatabaseVersion().then(function(version) {
		var db = new sqlite.Database("data." + version +".s3db", sqlite.OPEN_READWRITE, function(error) {
			if(error != null) {
				var rs = fs.createReadStream('assets/init/data.s3db');
				var ws = fs.createWriteStream("data." + version +".s3db");

				rs.on("error", function() {
					Window.getWindow().close(true);
				});

				ws.on("error", function() {
					Window.getWindow().close(true);
				});

				ws.on("close", function() {
					db_promise.resolve(
						new sqlite.Database("data." + version +".s3db")
					);
				});

				//TODO: Připravit upgrade mechanismus

				rs.pipe(ws);
			} else {
				db_promise.resolve(db);
			}
		});
	});

	
	
	return {
		perform: function(func) {

			db_promise.promise.then(function(db) {
				db.serialize(func(db));
				db.close;
				return;
			});
			
		}
	};
}]);