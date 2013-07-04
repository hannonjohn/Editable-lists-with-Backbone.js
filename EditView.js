//EditView is the view responsible for adding / editing, i.e. the edit-mode UI
//It holds a clone of the item models used in the Controller
//It is this view which is doing the saves and deletions back to the server (Backbone.sync)
//It will fire 3 callbacks to the Controller - options.saved(id), options.deleted(id), options.cancelled(id)
Namespace.CRUD.EditView = (function (options) {

	var EditView = Backbone.View.extend({
		template: _.template(Namespace.Templating.Render("Namespace/CRUD/EditView")),
		tagName: "li",
		className: "editView",
		model: Namespace.CRUD.ItemModel,
		events: {
			"click .actionDelete": "doRemove",
			"click .actionCancel": "cancel",
			"click .actionSave": "save",
		},
		initialize: function () {
			_.bindAll(this);
			this.bindModel();
			this.render();
			this.focusOnFirst();
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
			this.$el.find("input:first").focus();
		},
		show: function() {
			this.$el.fadeIn(200, this.focusOnFirst);
		},
		hide: function(callback) {
			var self = this;
			self.$el.fadeOut(200, callback);
		},
		doRemove: function () {
			var self = this;
			self.model.destroy({
				headers: { id: self.model.id },
				success: function() {
					self.hide(function() { options.deleted(self.model.id); });
				}
			});
			return false;
		},
		cancel: function () {
			var self = this;
			self.hide(function() { options.cancelled(self.model.id); });
			return false;
		},
		save: function() {
			var json = this.$el.serializeObject();
			this.model.save(json, { silent: true, success: this.saveSuccess });
			return false;
		},
		saveSuccess: function(model, response) {
			var self = this;
			self.hide(function() { options.saved(self.model.id, response); });
		}
	});

	var editView = new EditView({ model: options.model });
	return editView;
});