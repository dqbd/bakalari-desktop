var updater_version = "v1";

var nwgui = require("nw.gui");
var path = require('path');

var fs = require("fs");
var request = require("request");
var adm = require("adm-zip");

var promise = require("promise");

var server = "http://duong.cz/BakaParser/";

var path = require("path");

var updater = {
	check: function() {		
		updater.getCurrentVersion().then(function(version){
			updater.downloadVersionsList(version).then(function(data) {
				var newest_keys = Object.keys(data.data.versions);
				var newest = data.data.versions[newest_keys[newest_keys.length - 1]];

				if(version == false || data.data.updated == false) {
					updater.download(newest.file);
				} else {
					updater.runApp();
				}
			}, function(error) {
				if(version != false) {
					updater.runApp();
				} else {
					console.log(error);
					if(error == "Old version") {
						updater.setMessage("Máš starou verzi spouštěče, stáhni si mě znova na adrese <a onclick=\"updater.showUrl();\">http://duong.cz/skolar</a>");
					} else {
						updater.setMessage("Nedokážu stáhnout aplikaci, stáhni mě znova na adrese <a onclick=\"updater.showUrl();\">http://duong.cz/skolar</a>");
					}
					
					updater.setProgressBar(-1);
					nwgui.Window.get().show();
				}
			});
		});
	}, 
	downloadVersionsList: function(current) {
		return new promise(function(resolve, reject) {
			var url = server+"version";
			var form = (current != false) ? {"current" : current} : {};

			form.updater = updater_version;

			var timeout = setTimeout(function() {
				updater.setMessage("Hledám soubory ke spouštění");
				updater.setProgressBar(-1);
				nwgui.Window.get().show();
			}, 3000);

			request.post(url, {"form": form}, function(error, reponse, data) {
				clearTimeout(timeout);

				if(error == null) { 
					console.log(data);
					data = JSON.parse(data);

					if(data.status == "ok") {
						resolve(data);
					} else {
						reject(data.message);
					}
					
				} else {
					reject(error);
				}
			});
		});
	},
	getCurrentVersion: function() {
		return new promise(function(resolve) { 
			fs.readFile(path.join(nwgui.App.dataPath, "bin", "package.json"), "utf8", function(err, data) {
				if(err) {
					resolve(false);
				} else {
					resolve(JSON.parse(data).version);
				}
			});
		});
	},
	runApp: function() {
		nwgui.Shell.openItem(path.join(nwgui.App.dataPath, "bin", "nw.exe"));
		nwgui.Window.get().close();
	},
 	download: function(file) {
 		nwgui.Window.get().show();

 		var rq = request(server+"builds/"+file);
 		var out = fs.createWriteStream("temp.zip");
 		var receivedSize = totalSize = 0;

 		var receivedBuffer = 0;

 		var avgSpeed;

 		var timer = setInterval(function() {
 			if(typeof avgSpeed === "undefined" && receivedBuffer > 0) {
 				avgSpeed = receivedBuffer;
 			}

 			avgSpeed = 0.5 * receivedBuffer  + (1-0.5) * avgSpeed;

 			var remaining = totalSize - receivedSize;

 			updater.setMessage("Stahuji nejnovější verzi ("+updater.convertTimeToStr(remaining / avgSpeed)+")");

 			receivedBuffer = 0;
 		}, 1000);

 		rq.on("response", function ( data ) {
		    totalSize = data.headers['content-length'];
		});

		rq.on('data', function (data) {
			receivedSize += data.length;

			receivedBuffer += data.length;
			
			updater.setProgressBar((receivedSize / totalSize) * 100);

		})

		rq.on("end", function(data) {
			updater.setProgressBar(-1);
			updater.setMessage("Rozbaluji a spouštím aplikaci");

			clearInterval(timer);

			// počkáme, než se vše vykreslí
			setTimeout(function() {
				new promise(function(resolve) {
					var zip = new adm("temp.zip");
					zip.extractAllTo(path.join(nwgui.App.dataPath, "bin"), true);

					resolve("extracted");
				}).then(function(data) {
					fs.unlink("temp.zip");

					updater.runApp();
					nwgui.Window.get().close(true);
				});
			}, 1100);			
		});

        rq.pipe(out);
    },
    setProgressBar: function(percentage) {
    	var bar = document.getElementById("progress");

    	if(percentage == -1) {
    		document.getElementById("bar").style.display = "none";
    	} else {
    		bar.style.width = percentage + "%";
    	}
    	
    },
    setMessage: function(msg) {
    	document.getElementById("msg").innerHTML = msg;
    },
    showUrl: function() {
    	nwgui.Shell.openExternal("http://duong.cz/skolar");
    	nwgui.Window.get().close(true);
    },

    pluralSwitcher: function(num, one, twofour, more) {
    	return (num <= 1) ? one : ((num > 1 && num < 5) ? twofour : more);
    },

    convertTimeToStr: function(input) {
    	var days = Math.floor(input / (24*60*60));
 		var hours = Math.floor((input - days*24*60*60) / (60*60));
		var minutes = Math.floor((input - days*24*60*60 - hours*60*60) / 60);
		var seconds = Math.round(input - (days*24*60*60) - (hours*60*60) - (minutes*60));

		if(days > 0) {
			return 	updater.pluralSwitcher(days, "zbývá", "zbývají", "zbývá") + " " +days+ " "+  
					updater.pluralSwitcher(days, "den", "dny", "dnů");
		} else if (hours > 0) {
			return 	updater.pluralSwitcher(hours, "zbývá", "zbývají", "zbývá") + " " +hours+ " "+ 
					updater.pluralSwitcher(hours, "hodina", "hodiny", "hodin")
		} else if (minutes > 0) {
			return  updater.pluralSwitcher(minutes, "zbývá", "zbývají", "zbývá") + " " +minutes+ " "+  
					updater.pluralSwitcher(minutes, "minuta", "minuty", "minut");
		} else if (seconds > 0) {

			return	updater.pluralSwitcher(seconds, "zbývá", "zbývají", "zbývá") + " " +seconds+ " "+  
					updater.pluralSwitcher(seconds, "sekunda", "sekundy", "sekund");
		} else {
			return "zbývá necelá sekunda";
		}


	}
}

updater.check();
