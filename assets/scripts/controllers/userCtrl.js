app.controller("userCtrl", ["$scope", "$rootScope", "$q", "Utils", "Users", "Window", function($scope, $rootScope, $q, Utils, Users, Window) {

	var menu = new Window.nw.Menu();

	menu.append(new Window.nw.MenuItem({ label: 'Odstranit uživatele' }));
	menu.append(new Window.nw.MenuItem({ label: 'Upravit uživatele' }));

	$rootScope.$on("reload", function(event, arg) {
		if(arg.user == true) {			
			$scope.checkState();	
		}
	})
			
	$scope.checkState = function() {
		$q.all({"current":Users.getCurrentUser(), "users": Users.getUsers()}).then(function(result) {
			$scope.currentUser = result.current;
			$scope.users = result.users;
		});
	}

	$scope.changeUser = function(id) {
		Users.setCurrentUser(id);

		$rootScope.$emit("reload", {user: true});		
	};

	$scope.showMenu = function($event, id) {
		menu.popup(event.pageX, event.pageY);
		menu.items[0].click = function() {
			$scope.removeUser(id);
		}
		menu.items[1].click = function() {
			$scope.modifyUser(id);
		}
	}

	$scope.removeUser = function(id) {
		

		Users.removeUser(id).then(function() {
			
			if(Users.getCurrentUserID() == id) {

				Users.getFirstID().then(function(data) {
					if(data.min != null) {
						Users.setCurrentUser(data.min);
						$rootScope.$emit("reload", {user: true});	
					} else {
						//TODO: upravit tady tohle
						Window.getWindow().close(true);
					}
				});

			} else {
				$rootScope.$emit("reload", {user: true});	
			}

			
		});
	}

	$scope.modifyUser = function(id) {
		alert("Není dokončeno, dokončím...");
	}

	$scope.showAddUser = function() {
		Users.getCurrentUser().then(function(user) {
			Window.listen("closed", function(window) {
	            $rootScope.$emit("reload", {user: true});
	        }, Window.getWindow("newuser.html#/adduser?url="+user.url, new_win))
		})
	}
 
	$scope.color = Utils.subjectToColor;
	$scope.checkState();
}]);