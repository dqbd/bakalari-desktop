app.factory('Notifications', ['Window', 'Utils', "$timeout", function(Window, Utils, $timeout){

	var notify_window = Window.getWindow("notifications.html", GLOBALS.notify_win);
	var parent = this;
	var loaded = false;

	Window.listen("loaded", function() {
		loaded = true;

		notify_window.window.document.onclick = function() {
			parent.hide();
		}
	}, notify_window);

	this.exec = function(callback) {
		if(loaded) {
			callback(notify_window.window);
		} else {
			var check = setInterval(function() {
				if(loaded) {
					clearInterval(check);
					callback(notify_window.window);
				}
			}, 100);
		}
	}

	this.display = function(title, text, color) {
		parent.exec(function(local) {
			parent.show();

			setTimeout(parent.hide, 3000);

			// local.helper.append(title, text, color);
		});
	}

	this.show = function() {
		parent.moveWindow();
		notify_window.show();
	}

	this.hide = function() {
		notify_window.hide();
	}

	this.close = function() { 
		notify_window.close(true); 

	}

	this.moveWindow = function() {
		var x = screen.availLeft + screen.availWidth - (GLOBALS.notify_win.width+5);
		var y = (process.platform == "win32") ? screen.availHeight - GLOBALS.notify_win.height - 5 : screen.availTop; 

		notify_window.moveTo(x,y);
	}

	return this;
}])