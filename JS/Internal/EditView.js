//EditView is the view responsible for adding / editing, i.e. the edit-mode UI
//It holds a clone of the item models used in the Controller
//It is this view which is doing the saves and deletions back to the server (Backbone.sync)
//5 events will be triggered on the model which the Controller is listening to - "editStart", "saved", "deleted", "cancelled", "editEnd"
Namespace.CRUD.EditView = (function (options) {

	var EditView = Backbone.View.extend({
		template: _.template($("#templateEditView").html()),
		tagName: "li",
		className: "editView",
		model: Namespace.CRUD.ItemModel,
		events: {
			"click .actionDelete": "doRemove",
			"click .actionCancel": "cancel",
			"click .actionSave": "save",
		},
		initialize: function () {
			_.bindAll(this, "render", "shown", "hidden", "focusOnFirst", "saveSuccess");
			this.bindModel();
			this.render();
		},
		bindModel: function () {
			this.model.on("change", this.render);
		},
		render: function () {
			if (!this.model.id) this.$el.addClass("adding");
			else this.$el.removeClass("adding");

			this.$el.html(this.template(this.model.toJSON()));
		},
		focusOnFirst: function() {
			var self = this;
			self.$el.find("input:first").focus();
		},
		show: function() {
			this.$el.fadeIn(200, this.shown);
		},
		shown: function() {
			this.focusOnFirst();
			this.model.trigger("editStart");
		},
		hide: function(callback) {
			var self = this;
			self.$el.fadeOut(200, function() { self.hidden(callback); });
		},
		hidden: function(callback) {
			this.model.trigger("editEnd");
			callback();
		},
		doRemove: function () {
			var self = this;
			self.model.destroy({
				headers: { id: self.model.id },
				success: function() {
					self.hide(function() { self.model.trigger("deleted", self.model.id); });
				}
			});
			return false;
		},
		cancel: function () {
			var self = this;
			self.hide(function() { self.model.trigger("cancelled", self.model.id); });
			return false;
		},
		save: function() {
			var json = this.$el.serializeObject();
			this.model.save(json, { silent: true, success: this.saveSuccess });
			return false;
		},
		saveSuccess: function(model, response) {
			var self = this;
			self.hide(function() { self.model.trigger("saved", self.model); });
		}
	});

	var editView = new EditView({ model: options.model });
	return editView;
});