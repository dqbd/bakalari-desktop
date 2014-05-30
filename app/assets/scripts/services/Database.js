app.factory('Database', ['$rootScope', '$q', "Utils", "Window", function($rootScope, $q, Utils, Window) {
	var dbstore     = require("nedb");
	var fs 			= require("fs");
	var path 		= require("path");

	var version 	= Utils.getPackageValue("database-version");
	var location 	= path.join(Window.nw.App.dataPath, "Databases");
	var db_promise 	= $q.defer();

	var tables 		= ["users", "cache", "options"];
	var database    = {};

	tables.forEach(function(table) {
		database[table] = new dbstore({
			filename: path.join(location, table+"."+version+".db"),
			autoload: true
		});
	});


	this.perform = function(table, func) {
		func(database[table]);
	}

	return this;
}]);