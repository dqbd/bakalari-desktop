module.exports = function(grunt) {
	var date 		= new Date(),
		version 	= "0.8.5",
		nw_file 	= "";

	var request 	= require("request"),
		_ 			= require('lodash'),
		fs 			= require("fs"),
		progressbar = require("progress"),
		path 		= require("path"),
		q 			= require("q"),
		zlib		= require("zlib"),
		tar 		= require("tar-fs"),
		zip 		= require("zip");

	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	var settings = {
		filename: ("0"+date.getDate()).slice(-2) + ("0"+(date.getMonth()+1)).slice(-2) + date.getFullYear().toString() + ("0"+date.getHours()).slice(-2) + ("0"+date.getMinutes()).slice(-2) + ("0"+date.getSeconds()).slice(-2),
		download_url: 'http://dl.node-webkit.org/',
		platform_options: [{
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
		}],
		file_list: ["src/**", "!src/builds/**", "!src/node_modules/**", "!src/bower.json", "!src/*.s3db", "!src/*.sublime-project", "!src/*.sublime-workspace", "!src/*.log", "!src/assets/less/**",
					"src/node_modules/sqlite3/LICENSE", "src/node_modules/sqlite3/package.json", "src/node_modules/sqlite3/sqlite3.js", "src/node_modules/sqlite3/lib/**", "src/node_modules/sqlite3/node_modules/**"]
					.map(function(item) { return item.replace(/\//g, path.sep); })
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
	
	

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		src_pkg: grunt.file.readJSON(path.join('src', 'package.json')),
		compress: {
			zip: {
				options: {
					archive: path.join('.', 'builds', settings.filename+'.zip'),
					mode: "zip"
				},
				files: [{ src: settings.file_list }]
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
	

	grunt.registerTask("nw-download", "Downloads and extracts node-webkit", function() {
		var done 	= this.async();
		var dest 	= "src";
		var options = settings.platform_options[_.findIndex(settings.platform_options, {type: process.platform})];
		
		var url 	= grunt.template.process(options.url, {data: {"version": version}});
			nw_file = path.join("temp", url.split("/").slice(-1).toString());

		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}

		var out = fs.createWriteStream(nw_file);
		
		var srv = request(settings.download_url + url);

		srv.on("response", function(res) {
			var len = parseInt(res.headers['content-length'], 10);

			var bar = new progressbar('Stahuji'["magenta"]+' [:bar] :percent :etas', {
				complete: '=',
				incomplete: ' ',
				width: 30,
				total: len
			});

			srv.on("data", function(chunk) {
				bar.tick(chunk.length);
			});

			srv.on("end", function() {
				grunt.log.writeln("Staženo, rozbaluji"["green"]);

				if(path.extname(nw_file) === ".zip") {
					var zipReader = zip.Reader(fs.readFileSync(nw_file));

					zipReader.forEach(function(entry) {				
						var mode = entry.getMode(), shortpath = path.join(dest, entry.getName()), filepath = path.resolve(shortpath);

						if(_.intersection(shortpath.split(path.sep), options.files).length > 0) {
							console.log("Rozbaluji soubor: "["grey"]+path.basename(filepath)["green"]);
							if(entry.isDirectory()) {
								grunt.file.mkdir(filepath, function(err) {
									if(mode) { fs.chmodSync(filepath, mode); }
								});
							} else {
								grunt.file.mkdir(path.dirname(filepath));
								fs.writeFileSync(filepath, entry.getData());

								if(mode) { fs.chmodSync(filepath, mode); }
							}
						}
					});

					done(true);

				} else {
					fs.createReadStream(nw_file)
						.pipe(zlib.createGunzip())
						.pipe(tar.extract("temp"))
						.on('finish', function() {
							var basename = path.basename(nw_file, '.tar.gz');

							fs.readdir(path.join("temp", basename), function(err, files) {
								_.intersection(files, options.files).forEach(function(file) {

									console.log("Kopíruji soubor: "["grey"]+path.basename(file)["green"]);

									fs.renameSync(path.join("temp", basename, file), 
												  path.join(dest, file));
								});

								done(true);
							});
						});
				}	
			});
		});

		srv.pipe(out);
	});

	grunt.registerTask("verify-structure", "Checks, if the server address is set correctly", function() {
		var file = grunt.file.read(path.join("src", "assets", "scripts", "defaults.js"), {encoding:"UTF8"});

		grunt.log.writeln();
		grunt.log.writeln("Verze balíčku: "["cyan"] + grunt.config.get("src_pkg.version")["green"]);
		grunt.log.writeln("Název souboru: "["cyan"] + (settings.filename+".zip")["green"]);

		if(file.match(/var\s+host\s*=\s*"duong\.cz"/) == null) {
			grunt.fail.warn("Není nastaven správě host na server");
		}
	});

	grunt.registerTask("init", ["nw-download", "shell", "clean"]);
	grunt.registerTask('dist', ['verify-structure', 'compress']);
	grunt.registerTask('default', ['verify-structure']);
};