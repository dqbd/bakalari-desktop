app.factory("Page", ["$rootScope", "$q", "Parser", "Progress", function($rootScope, $q, Parser, Progress) {    

	var parent = this;

	this.codeString = {
		"server-error": "Chyba na straně serveru",
		"no-connection": "Nejsi připojen na internetu",
		"not-login": "Nejsi přihlášený"
	};

	this.get = function(page, force, arg) {
		Progress.showLoading();

		var callback = function(response) {
			return parent.statusHandler(response, page);
		}

		return Parser.get(page, (arg) ? arg : {}, force).then(callback, callback);
	}

	this.statusHandler = function(response, page) {
		var deferred = $q.defer();

		if(response.status == "ok") {
			if(_.isEmpty(response.data) || _.isEmpty(response.data[page])) {
				Progress.showError("Nemáme k dispozici žádné data", "sad", "Je možné, že není nic nového :)");
			} else {
				Progress.hideAll();
			}

			if(response.cached == false) {
				Parser.writeIntoCache(page, response.input.user, response.input.args, response);
			}

			parent.broadcastViews(page, response.data.views);
			deferred.resolve(response.data);
		} else {
			if(response.message == "Neexistující požadavek") {
				Progress.showError("Tato stránka neexistuje na Bakalářích (nebo nefunguje)", "sad", "Pokud to tam má být, zkus aktualizovat");
			} else  {
				var msg = (response.message != null) ? response.message : ((response.code in parent.codeString) ? parent.codeString[response.code] : "");

				if((response.data != null && response.data.status == 0 && response.data.data == null && response.code == "server-error") == false) {
					Progress.showError("Chyba na straně serveru", "error", msg);
				}
				
			} 
			deferred.reject();
		} 
		return deferred.promise;
	}

	this.broadcastViews = function(page, views) {
		$rootScope.$emit("sidebar-views", (views && views.length > 0) ? views : []);
	}

	return this;

}]);