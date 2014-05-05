module.exports = function(grunt) {

	var date = new Date();

	var version = "0.8.5";

	var request = require("request");
	var _ = require('lodash');
	var fs = require("fs");
	var progressbar = require("progress");
	var path = require("path");
	var q = require("q");
	var admzip = require("adm-zip");

	var zlib = require("zlib");
	var tar = require("tar-fs");

	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	var settings = {
		filename: ("0"+date.getDate()).slice(-2) + ("0"+(date.getMonth()+1)).slice(-2) + date.getFullYear().toString() + ("0"+date.getHours()).slice(-2) + ("0"+date.getMinutes()).slice(-2) + ("0"+date.getSeconds()).slice(-2),
		download_url: 'http://dl.node-webkit.org/'
	};

	var platform_options = [{
		'url': "v<%= version %>/node-webkit-v<%= version %>-win-ia32.zip",
		'type': 'win32',
		'files': ['ffmpegsumo.dll', 'icudt.dll', 'libEGL.dll', 'libGLESv2.dll', 'nw.exe', 'nw.pak'],
		'exclude': ['nwsnapshot.exe']
	}, {
		'url': "v<%= version %>/node-webkit-v<%= version %>-osx-ia32.zip",
		'type': 'darwin',
		'files': ['node-webkit.app'],
		'exclude': ['nwsnapshot']
	}, {
		'url': "v<%= version %>/node-webkit-v<%= version %>-linux-ia32.tar.gz",
		'type': 'linux',
		'files': ['nw', 'nw.pak', 'libffmpegsumo.so'],
		'exclude': ['nwsnapshot']
	}];

	var file_list = ["src/**", "!src/builds/**", "!src/node_modules/**", "!src/bower.json", "!src/*.s3db", "!src/*.sublime-project", "!src/*.sublime-workspace", "!src/*.log", "!src/assets/less/**",
		"src/node_modules/sqlite3/LICENSE", "src/node_modules/sqlite3/package.json", "src/node_modules/sqlite3/sqlite3.js", "src/node_modules/sqlite3/lib/**", "src/node_modules/sqlite3/node_modules/**"]
		.map(function(item) { return item.replace(/\//g, path.sep); });
	
	var nw_file;
	var options = platform_options[_.findIndex(platform_options, {type: process.platform})];

	// var options = platform_options[2];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compress: {
			zip: {
				options: {
					archive: path.join('.', 'builds', settings.filename+'.zip'),
					mode: "zip"
				},
				files: [{ src: file_list }]
			}
		},
		shell: {
			install: {
				command: "npm install --build-from-source --runtime=node-webkit --target_arch=ia32 --target="+version,
				options: {
					stderr: true,
					execOptions: { cwd: 'src' }
				}
			}
		},
		clean: ["temp"+path.sep+"*.*"],
		unzip: {
			temp: nw_file,
		}
	});
	

	grunt.registerTask("nw-download", "downloads node-webkit", function() {
		var done = this.async();
		
		var url = grunt.template.process(options.url, {data: {"version": version}});
		nw_file = path.join("temp", url.split("/").slice(-1).toString());

		if (!fs.existsSync("temp")) {
			fs.mkdirSync("temp");
		}

		var out = fs.createWriteStream(nw_file);
		
		var srv = request(settings.download_url + url);

		srv.on("response", function(res) {
			var len = parseInt(res.headers['content-length'], 10);

			var bar = new progressbar('Stahuji'["red"]+' [:bar] :percent :etas', {
				complete: '=',
				incomplete: ' ',
				width: 30,
				total: len
			});

			srv.on("data", function(chunk) {
				bar.tick(chunk.length);
			});

			srv.on("end", function() {
				grunt.log.writeln("Staženo, rozbaluji"["blue"]);

				if(path.extname(nw_file) === ".zip") {

					var zip = new admzip(nw_file);

					zip.getEntries().forEach(function(entry) {
						if(options.files.indexOf(entry.name) > -1) {
							zip.extractEntryTo(entry.entryName, "src", true, true);
						}
					});

					done(true);

				} else if (path.extname(nw_file) === ".gz") {
					fs.createReadStream(nw_file)
						.pipe(zlib.createGunzip())
						.pipe(tar.extract("temp"))
						.on('finish', function() {
							var basename = path.basename(nw_file, '.tar.gz');

							fs.readdir(path.join("temp", basename), function(err, files) {
								_.intersection(files, options.files).forEach(function(file) {
									fs.renameSync(path.join("temp", basename, file), 
												  path.join("src", file));
								});

								done(true);
							});
					});
				}

				
			});
		});

		srv.pipe(out);
	});

	grunt.registerTask("verify-structure", "tries, if everything is alright", function() {
		var file = grunt.file.read(path.join("src", "assets", "scripts", "defaults.js"), {encoding:"UTF8"});

		grunt.log.writeln();
		grunt.log.writeln("Verze balíčku: " + grunt.config.get("pkg.version")["green"]);
		grunt.log.writeln("Název souboru: " + (settings.filename+".zip")["green"]);
		grunt.log.writeln();

		if(file.match(/var\s+host\s*=\s*"duong\.cz"/) == null) {
			grunt.fail.warn("Není nastaven správě host na server");
		}
	});

	grunt.registerTask("init", ["nw-download", "clean"]);

	grunt.registerTask('default', ['verify-structure', 'compress']);

};