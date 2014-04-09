app.factory('Database', ['$rootScope', '$q', function($rootScope, $q) {
	var sqlite = require("sqlite3").verbose();
	var db = new sqlite.Database("data.s3db");

	
	return {
		getDatabase: function() {
			return db;
		},
		perform: function(func) {
			db.serialize(func(db));
		},
		closeDatabase: function() {
			db.close;
			return;
		}
	};
}]);