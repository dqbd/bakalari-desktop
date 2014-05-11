app.factory('Database', ['$rootScope', '$q', "Window", function($rootScope, $q, Window) {
	var sqlite = require("sqlite3").verbose();
	var fs = require("fs");
	var path = require("path");


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
		var location = path.join(Window.nw.App.dataPath, "data." + version +".s3db");

		var db = new sqlite.Database(location, sqlite.OPEN_READWRITE, function(error) {
			if(error != null) {
				var rs = fs.createReadStream('assets/init/data.s3db');
				var ws = fs.createWriteStream(location);

				rs.on("error", function() {
					Window.getWindow().close(true);
				});

				ws.on("error", function() {
					Window.getWindow().close(true);
				});

				ws.on("close", function() {
					db_promise.resolve(
						new sqlite.Database(location)
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