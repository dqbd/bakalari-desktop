app.controller("userCtrl", ["$scope", "$rootScope", "$q", "Utils", "Users", function($scope, $rootScope, $q, Utils, Users) {

	$rootScope.$on("reload", function(event, arg) {
		if(arg == true) {
			console.log("triggers?");
			
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

		$rootScope.$broadcast("reload", true);		
	};

	$scope.color = Utils.subjectToColor;
	$scope.checkState();
}]);