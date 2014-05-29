app.factory("Updater", ["$rootScope", "Utils", "Parser", function($rootScope, Utils, Parser) {

	var fs 		= require("fs"),
		tar 	= require("tar-fs"),
		zlib 	= require("zlib"),
		path	= require("path");

	var self 	= this;

	this.checkNewest = function() {
		var version = Utils.getPackageValue("updater-version");

		Parser.accessServer("update", {"version": version}).then(function(data) {
			
		});
	}

	// this.extract = function(where, to) {
	// 	fs.createReadStream(where)
	// 		.pipe(zlib.createGunzip())
	// 		.pipe(tar.extract("temp"+path.sep+"de"))
	// }

	return this;
}]);