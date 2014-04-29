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
		if(response.status == "ok") {
			console.log(page);

			if(_.isEmpty(response.data) || _.isEmpty(response.data[page])) {
				Progress.showError("Nemáme k dispozici žádné data", "sad", "Je možné, že není nic nového :)");
			} else {
				Progress.hideAll();
			}

			
			parent.broadcastViews(response.data.views);
			

			return response.data;

		} else {
			if(response.message == "Neexistující požadavek") {
				Progress.showError("Tato stránka neexistuje na Bakalářích (nebo nefunguje)", "sad", "Pokud to tam má být, zkus aktualizovat");
			} else {
				Progress.showError("Chyba na straně serveru", "error", response.message);
			}
		}
	}

	this.broadcastViews = function(views) {
		$rootScope.$emit("sidebar-views", (views && views.length > 0) ? views : []);
	}

	return this;

}]);