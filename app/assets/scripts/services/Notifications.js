app.factory('Notifications', ['Window', 'Utils', "$timeout", function(Window, Utils, $timeout){

	var notify_window = Window.getWindow("notification.html", notify_win);
	var parent = this;
	var loaded = false;

	Window.listen("loaded", function() {
		loaded = true;
	}, notify_window);


	// notify_window.setShowInTaskbar(false);

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

			local.helper.append(title, text, color);
			console.log(local.helper.list());
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
		var x = screen.availLeft + screen.availWidth - (notify_win.width+5);
		var y = (process.platform == "win32") ? screen.availHeight - notify_win.height - 5 : screen.availTop; 

		notify_window.moveTo(x,y);
	}

	return this;
}])