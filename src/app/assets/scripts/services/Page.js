app.factory("Page", ["$rootScope", "$q", "$state", "Parser", "Progress", function($rootScope, $q, $state, Parser, Progress) {    

	var parent = this;
	var callbacks = {};
	var tasks = [];

	var demandingResult = [];

	var sidebarCache = argumentCache = defaultCallback = {};

	var viewsCallback = {};

	this.codeString = {
		"server-error": "Chyba na straně serveru",
		"no-connection": "Nejsi připojen na internetu",
		"not-login": "Nejsi přihlášený",
		"empty-return": {type: "sad", desc: "Je možné, že není nic nového :)", title: "Nemáme tu co zobrazit"}
	}

	this.ids = {"main": "main", "daemon": "daemon", "sidebar": "sidebar"};

	defaultCallback.sidebar = function(response, page) {
		if(!_.isEmpty(response)) {
			sidebarCache[page] = response;
		} else if (!(page in sidebarCache)) {
			sidebarCache[page] = [];
		}

		$rootScope.$emit("sidebar-views", sidebarCache[page]);
	}

	defaultCallback.notify = function(response, page) {
		Progress.showLoading();
	}

	defaultCallback.fail = function(response, page) {
		if(response.message == "Neexistující požadavek") {
			Progress.showError("Tato stránka neexistuje na Bakalářích (nebo nefunguje)", "sad", "Pokud to tam má být, zkus aktualizovat");
		} else  {
			var msg = (response.message != null) ? response.message : ((response.code in parent.codeString) ? parent.codeString[response.code] : "");

			if((response.data != null && response.data.status == 0 && response.data.data == null && response.code == "server-error") == false) {
				if(_.isObject(msg)) {
					Progress.showError(msg.title, msg.type, msg.desc);
				} else {
					Progress.showError("Chyba na straně serveru", "error", msg);
				}
			}
		} 
	}

	this.getApiFromPage = function(page) {
		page = (_.isUndefined(page)) ? $state.current.name : page;

		var target = _.findWhere(GLOBALS.pages, {"name": page});
		return (!_.isEmpty(target)) ? target.api : null;
	}

	this.registerPage = function(page, callback) {
		if(_.isFunction(callback)) {
			response = {"success": function(data, page) {
				callback(data, page);
				Progress.hideLoading();
			}};
		} else {
			response = callback;
		}

		parent.registerCallback(parent.ids.main, parent.getApiFromPage(page), response);
	}

	this.registerCallback = function(id, api, callback) {
		if(api == null) return;

		if(!(api in callbacks)) {
			callbacks[api] = {};
		}

		callbacks[api][id] = callback;

		parent.downloadPage(id, api, {}, false);
	}

	this.removePage = function(page) {
		var target = parent.getApiFromPage(page);

		if(!_.isEmpty(target)) {
			parent.removeCallback(parent.ids.main, target);
		}
	}

	this.removeCallback = function(id, api) {
		if(api in callbacks) {
			delete callbacks[api][id];
		}
	} 

	this.executeCallbacks = function(type, response, api) {
		if((api in callbacks)) {
			_.each(callbacks[api], function(callback) {
				if(_.isFunction(callback[type])) {
					callback[type](response, api);
				} else if (_.isUndefined(callback[type]) && _.isFunction(defaultCallback[type])) { //in case not defined, let run basic
					defaultCallback[type](response, api);
				} 
			});
		} 
	}

	this.addRunner = function(id, api, arg) {
		if(_.isUndefined(parent.hasRunner(id, api, arg))) {
			demandingResult.push({"id": id, "api":api, "arg":arg});
		}
	}

	this.hasRunner = function(id, api, arg) {
		return _.findWhere(demandingResult, {"id": id, "api":api, "arg":arg});
	}

	this.removeRunners = function(id, api) {
		demandingResult = _.filter(demandingResult, function(item) {
			if(!_.isUndefined(api)) {
				return (item.id != id || item.api != api);
			} else {
				return item.id != id;
			}
		});
	}

	this.downloadPage = function(id, api, arg, force) {
		var check = _.findWhere(tasks, {"api": api, "arg":arg});

		if(!check) {
			tasks.push({"api":api, "arg":arg});
			parent.addRunner(id, api, arg);

			parent.executeCallbacks("notify", null, api);
			parent.executeCallbacks("sidebar", null, api);

			Parser.get(api, arg, force).then(function(response) {
				if(response.cached == false) {
					Parser.writeIntoCache(api, response.input.user, response.input.args, response);
				}

				if (parent.hasRunner(id, api, arg)) {
					console.log("showing: "+api)
					parent.executeCallbacks("sidebar", response.data.views, api);
					parent.executeCallbacks("success", response.data, api);
				}
			}, function(response) {
				if (parent.hasRunner(id, api, arg)) {
					console.log("showing-failure: "+api)
					parent.executeCallbacks("fail", response, api);
				} 
			}).then(function() {
				delete tasks[check];
			});
		}
	}

	this.refreshPage = function() {
		arg = (_.isEmpty($state.current.view)) ? {} : {"view": $state.current.view};
		parent.downloadPage(parent.ids.main, parent.getApiFromPage(), arg, true);
	}

	this.downloadView = function(arg) {
		$state.current.view = arg;

		parent.removeRunners(parent.ids.main, parent.getApiFromPage());
		parent.downloadPage(parent.ids.main, parent.getApiFromPage(), {"view": $state.current.view}, false);
	}

	this.getCurrentView = function() {
		return $state.current.view;
	}

	return this;
}]);