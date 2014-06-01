var helper = {
	notifications: [],
	append: function(name, text) {
		helper.notifications.push({"name": name, "text": text});
	},
	list: function() {
		return helper.notifications;
	}
}