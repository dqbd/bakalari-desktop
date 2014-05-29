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

	require('jit-grunt')(grunt, {
		"useminPrepare": "grunt-usemin"
	});

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
		file_list: ["**", "!node_modules/**", "!bower.json", "!*.s3db", "!*.sublime-project", "!*.sublime-workspace", "!*.log", "!assets/less/**", "!assets/scripts/**", "!assets/components/**", "!.bowerrc", 
					"node_modules/sqlite3/LICENSE", "node_modules/sqlite3/package.json", "node_modules/sqlite3/sqlite3.js", "node_modules/sqlite3/lib/**", "node_modules/sqlite3/node_modules/**"]
					.map(function(item) { return item.replace(/\//g, path.sep); })
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		src_pkg: grunt.file.readJSON(path.join('app', 'package.json')),
		compress: {
			webkit: {
				options: {
					archive: path.join('.', 'builds', 'engine.tar.gz'),
					mode: "tgz"
				},
				files: [{ 
					expand: true,
					cwd: "webkit"+path.sep,
					src: ["**"] 
				}]
			},
			app: {
				options: {
					archive: path.join('.', 'builds', 'app.tar.gz'),
					mode: "tgz"
				},
				files: [{
					expand: true,
					cwd: "dist"+path.sep,
					src: ["**"]
				}]
			},
			updater: {
				options: {
					archive: path.join('.', 'builds', 'app.tar.gz'),
					mode: "tgz"
				},
				files: [{
					expand: true,
					cwd: "dist"+path.sep,
					src: ["**"]
				}]
			}
		},
		shell: {
			install: {
				command: "npm install --build-from-source --runtime=node-webkit --target_arch=ia32 --target="+version,
				options: {
					stderr: true,
					execOptions: { cwd: 'app' }
				}
			}
		},
		clean: {
			temp: ["temp"+path.sep+"*.*"],
			other: [".tmp"+path.sep+"*.*"],
			dist: ["dist"+path.sep+"*.*"],
			folders: ["temp"+path.sep, "dist"+path.sep, ".tmp"+path.sep]
		},
		unzip: {
			temp: nw_file,
		}, 
		watch: {
			less: {
				files: ["app/assets/less/*.less"],
				tasks: ["newer:less:development"]
			},
			installer: {
				files: ["installer/assets/*.less"],
				tasks: ["less:installer"]
			}
		},
		less: {
			development: {
				files: {
					"app/assets/css/main.css": "app/assets/less/main.less",
					"app/assets/css/newuser.css": "app/assets/less/newuser.less"
				}
			},
			production: {
				options: {
					cleancss: true,
					compress: true
				},
				files: {
					"app/assets/css/main.css": "app/assets/less/main.less",
					"app/assets/css/newuser.css": "app/assets/less/newuser.less"
				}
			},
			installer: {
				files: {
					"installer/assets/main.css" : "installer/assets/main.less"
				}
			}
		},
		copy: {
			src: {
				files: [{expand:true, src: settings.file_list, cwd:"app"+path.sep, dest: "dist" }]
			}
		},
		useminPrepare: {
			html: ['app/main.html', 'app/newuser.html'],
		    options: {
	      		dest: 'dist'
		    }
		},
		usemin: {
		  	html: ['dist/main.html', 'dist/newuser.html']
	  	}

	});
	

	grunt.registerTask("nw-download", "Downloads and extracts node-webkit", function() {
		var done 	= this.async();
		var dest 	= "app";
		var temp 	= "temp";
		var attempt = 0;
		var options = settings.platform_options[_.findIndex(settings.platform_options, {type: process.platform})];
		
		var url 	= grunt.template.process(options.url, {data: {"version": version}});
			nw_file = path.join("temp", url.split("/").slice(-1).toString());

		var callback = function() {
			grunt.log.writeln("Staženo, rozbaluji"["green"]);

			attempt++;

			try {
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
						.pipe(tar.extract(temp))
						.on('finish', function() {
							var basename = path.basename(nw_file, '.tar.gz');

							fs.readdir(path.join(temp, basename), function(err, files) {
								_.intersection(files, options.files).forEach(function(file) {

									console.log("Kopíruji soubor: "["grey"]+path.basename(file)["green"]);

									fs.renameSync(path.join(temp, basename, file), 
												  path.join(dest, file));
								});

								done(true);
							});
						});
				}	
			} catch (err) {

				if(attempt > 3) {
					grunt.fail.fatal("Nemohu stáhnout binární soubory nw");
				} else {
					grunt.log.writeln(("Došlo k chybě při rozbalování ("+err.toString()+"), "+attempt+". pokus na stažení: ")["red"]);
					download(callback);
				}
				
			}
		}

		var download = function(callback) {
			var out = fs.createWriteStream(nw_file);
				srv = request(settings.download_url + url);

			srv.on("response", function(res) {
				var len = parseInt(res.headers['content-length'], 10),
					bar = new progressbar('Stahuji'["magenta"]+' [:bar] :percent :etas', {
						complete: '=',
						incomplete: ' ',
						width: 30,
						total: len
					});

				srv.on("data", function(chunk) {
					bar.tick(chunk.length);
				});

				srv.on("end", function() {
					callback();
				});
			});

			srv.pipe(out);
		}

		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}

		if (!fs.existsSync(temp)) {
			fs.mkdirSync(temp);
		}

		if(!fs.existsSync(nw_file)) {
			download(callback);
		} else {
			callback();
		}
	});

	grunt.registerTask("verify-structure", "Checks, if the server address is set correctly", function() {
		var file = grunt.file.read(path.join("app", "assets", "scripts", "defaults.js"), {encoding:"UTF8"});

		grunt.log.writeln();
		grunt.log.writeln("Verze balíčku: "["cyan"] + grunt.config.get("src_pkg.version")["green"]);
		grunt.log.writeln("Název souboru: "["cyan"] + (settings.filename+".zip")["green"]);

		if(file.match(/var\s+host\s*=\s*"duong\.cz"/) == null) {
			grunt.fail.warn("Není nastaven správě host na server");
		}
	});

	grunt.registerTask("init", ["nw-download", "shell", "less:development", "flush"]);
	grunt.registerTask('dist', ['less:production', 'clean:dist', 'copy', 'useminPrepare', 'concat', 'uglify', 'usemin']);
	grunt.registerTask("flush", ["clean:dist", "clean:temp", "clean:other", "clean:folders"]);

	grunt.registerTask('publish', ['verify-structure', 'dist', 'compress', 'flush'])
	grunt.registerTask('default', ['verify-structure']);
};