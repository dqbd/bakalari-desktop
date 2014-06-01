app.controller("userCtrl", ["$scope", "$rootScope", "$q", "Utils", "Users", "Window", function($scope, $rootScope, $q, Utils, Users, Window) {

	var menu = new Window.nw.Menu();

	menu.append(new Window.nw.MenuItem({ label: 'Odstranit uživatele' }));

	$rootScope.$on("user", function() {
		$scope.checkState();
	});


	$scope.checkState = function() {
		$q.all({"current":Users.getCurrentUser(), "users": Users.getUsers()}).then(function(result) {
			$scope.currentUser = result.current;

			$scope.users = result.users;
		});
	}

	$scope.changeUser = function(id) {

		if(Users.getCurrentUserID() != id) {
			Users.setCurrentUser(id);

			$rootScope.$emit("user");	
		}
	};

	$scope.showMenu = function($event, id) {
		menu.popup(event.pageX, event.pageY);
		menu.items[0].click = function() {
			$scope.removeUser(id);
		}
		// menu.items[1].click = function() {
		// 	$scope.modifyUser(id);
		// }
	}

	$scope.removeUser = function(id) {
		Users.removeUser(id).then(function() {
			
			if(Users.getCurrentUserID() == id) {

				Users.getFirstID().then(function(fid) {
					if(fid != null) {
						Users.setCurrentUser(fid);
						$rootScope.$emit("user");	
					} else {
						//TODO: upravit tady tohle
						Window.getWindow().close(true);
					}
				});

			} else {
				$rootScope.$emit("user");	
			}
		});
	}

	$scope.modifyUser = function(id) {
		alert("Není dokončeno, dokončím...");
	}


	$scope.showAddUser = function(callback) {
		// var popup = 
		// callback = (callback) ? callback : function(user) {
		// 	Window.listen("closed", function(window) {
	 //            $rootScope.$emit("user");
	 //        }, Window.getWindow("newuser.html#/adduser?url="+user.url, new_win));
		// };


		Users.getCurrentUser().then(function(user) {
			var popup = Window.getWindow("newuser.html#/adduser", GLOBALS.adduser_win);
			Window.listen("loaded", function(win) {

				win.window.callback = function(added) {
					win.close();

					Users.insertUser(added).then(function(id) { //added
                        Users.setCurrentUser(id);
                        $rootScope.$emit("user");
                    });
				}

			}, popup);

			
		});
	}
 
	$scope.color = Utils.subjectToColor;
	$scope.checkState();
}]);