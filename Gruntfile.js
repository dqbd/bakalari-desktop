module.exports = function(grunt) {
	var date 		= new Date(),
		version 	= "0.9.2",
		nw_file 	= "";

	var request 	= require("request"),
		_ 			= require('lodash'),
		fs 			= require("fs"),
		mkdirp		= require("mkdirp"),
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
		build_folder: ("0"+date.getDate()).slice(-2) + "." + ("0"+(date.getMonth()+1)).slice(-2) + "." + date.getFullYear().toString() + " - " + ("0"+(date.getHours()+1)).slice(-2) + "." + ("0"+(date.getMinutes()+1)).slice(-2) + "."+("0"+(date.getSeconds()+1)).slice(-2),
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
		file_list: ["**", "!node_modules/**", "!bower.json", "!*.sublime-project", "!*.sublime-workspace", "!*.log", "!assets/less/**", "!assets/scripts/**", "!assets/components/**", "!.bowerrc",
					"node_modules/nedb/index.js", "node_modules/nedb/package.json", "node_modules/nedb/lib/**", "node_modules/nedb/node_modules/**"]
					.map(function(item) { return item.replace(/\//g, path.sep); })
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		src_pkg: grunt.file.readJSON(path.join('src', 'app', 'package.json')),
		compress: {
			app: {
				options: {
					archive: path.join('.', 'builds', settings.build_folder, 'app.tar.gz'),
					mode: "tgz"
				},
				files: [{
					expand: true,
					cwd: path.join("dist", "app"),
					src: ["**"]
				}]
			},
			webkit: {
				options: {
					archive: path.join('.', 'builds', settings.build_folder, 'engine.tar.gz'),
					mode: "tgz"
				},
				files: [{ 
					expand: true,
					cwd: path.join("dist", "webkit"),
					src: ["**"] 
				}]
			},
			installer: {
				options: {
					archive: path.join('.', 'builds', settings.build_folder, 'installer.tar.gz'),
					mode: "tgz"
				},
				files: [{
					expand: true,
					cwd: path.join("src", "installer"),
					src: ["**"]
				}]
			},
			updater: {
				options: {
					archive: path.join('.', 'builds', settings.build_folder, 'updater.tar.gz'),
					mode: "tgz"
				},
				files: [{
					expand: true,
					cwd: path.join("src", "updater"),
					src: ["**"]
				}]
			}
		},
		shell: {
			start: {
				command: "run.bat" + " " + path.resolve(".", "src", "app") + " " + path.resolve(".", "dist", "webkit"),
				options: {
					stderr: true,
					execOptions: {
						cwd: path.join("tools", "build-system")
					}
				}
			},
			app: { command: "npm install", options: {stderr: true, execOptions: { cwd: path.join('src','app') }}},
			installer: { command: "npm install", options: {stderr: true, execOptions: { cwd: path.join('src','installer') }}},
			updater: { command: "npm install", options: {stderr: true, execOptions: { cwd: path.join('src','updater') }}}
		},
		clean: {
			temp: ["temp"+path.sep+"*.*"],
			other: [".tmp"+path.sep+"*.*"],
			app: [path.join("dist", "app", "*")],
			webkit: [path.join("dist", "webkit", "*")],
			folders: ["temp"+path.sep, ".tmp"+path.sep]
		},
		watch: {
			less: {
				files: ["src/app/assets/less/*.less"],
				tasks: ["newer:less:development"]
			}
		},
		less: {
			development: {
				files: {
					"src/app/assets/css/main.css": "src/app/assets/less/main.less",
					"src/app/assets/css/newuser.css": "src/app/assets/less/newuser.less",
					"src/app/assets/css/notifications.css": "src/app/assets/less/notifications.less"
				}
			},
			production: {
				options: {
					cleancss: true,
					compress: true
				},
				files: {
					"dist/app/assets/css/main.css": "dist/app/assets/less/main.less",
					"dist/app/assets/css/newuser.css": "dist/app/assets/less/newuser.less",
					"dist/app/assets/css/notifications.css": "dist/app/assets/less/notifications.less"
				}
			}
		},
		copy: {
			app: {
				files: [{expand:true, src: settings.file_list, cwd: path.join("src", "app"), dest: path.join("dist", "app") }]
			}
		},
		useminPrepare: {
			html: ['src/app/main.html', 'src/app/newuser.html', 'src/app/notifications.html'],
		    options: {
	      		dest: 'dist/app'
		    }
		},
		usemin: {
		  	html: ['dist/app/main.html', 'dist/app/newuser.html', 'dist/app/notifications.html']
	  	}

	});
	

	grunt.registerTask("nw-download", "Downloads and extracts node-webkit", function() {
		var done 	= this.async();
		var dest 	= path.join("dist","webkit");
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
			mkdirp.sync(dest);
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
		var file = grunt.file.read(path.join("src", "app", "assets", "scripts", "defaults.js"), {encoding:"UTF8"});

		//Člověk by si říkal, co tu k čertu dělá eval. Já mám celkem solidní důvěru ve svém kódu.
		var globals = eval('('+file.match(/var globals\s*?=\s*?([\s\S]*?);$/mi)[1]+')');

		grunt.log.writeln();
		grunt.log.writeln("Verze balíčku: "["cyan"] + grunt.config.get("src_pkg.version")["green"]);

		
		if(globals.host != "duong.cz") {
			grunt.fail.warn("Není nastaven správě host na server");
		}
	});

	grunt.registerTask("install-dep", ["shell:app", "shell:installer", "shell:updater"]);
	grunt.registerTask("init", ["clean:webkit", "nw-download", "install-dep", "less:development", "flush"]);

	grunt.registerTask("compress-all", ["compress:app", "compress:webkit", "compress:updater", "compress:installer"]);

	grunt.registerTask("start", ["shell:start"]);


	grunt.registerTask('dist', ['clean:app', 'copy', 'less:production', 'useminPrepare', 'concat', 'uglify', 'usemin']);
	grunt.registerTask("flush", ["clean:temp", "clean:other", "clean:folders"]);

	grunt.registerTask('publish', ['verify-structure', 'dist', 'compress-all', 'flush']);
	grunt.registerTask('default', ['verify-structure']);
};