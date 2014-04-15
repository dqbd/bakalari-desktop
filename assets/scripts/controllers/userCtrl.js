app.controller("userCtrl", ["$scope", "$rootScope", "$q", "Utils", "Users", "Window", function($scope, $rootScope, $q, Utils, Users, Window) {

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

		$rootScope.$broadcast("reload", {user: true});		
	};

	$scope.showAddUser = function() {
		Users.getCurrentUser().then(function(user) {
			Window.listen("closed", function(window) {
	            $rootScope.$broadcast("reload", {user: true});
	        }, Window.getWindow("newuser.html#/adduser?url="+user.url, new_win))
		})
	}
 
	$scope.color = Utils.subjectToColor;
	$scope.checkState();
}]);