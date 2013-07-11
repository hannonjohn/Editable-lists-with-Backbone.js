//Controller is responsible for managing the item, list and edit views
Namespace.CRUD.Controller = (function (options) {
		
	var editView; //Global reference to a single edit view
	var editModel; //editView's model will be a clone of the item currently being edited / added
	var editing = false;

	//ItemView is only responsible for the view-mode UI, the editView is responsible for the edit-mode UI
	var ItemView = Backbone.View.extend({
		template: _.template($("#templateItemView").html()),
		tagName: "li",
		events: { "click .actionEdit": "edit" },
		model: Namespace.CRUD.ItemModel,
		initialize: function () {
			this.bindModel();
		},
		bindModel: function () {
			this.model.on("change", this.renderAndShow, this);
			this.model.on("deleted", this.deleted, this);
			this.model.on("cancelled", this.cancelled, this);
		},
		renderAndShow: function() {
			this.render().fadeIn(200);
		},
		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this.$el;
		},
		edit: function () {
			if (editing) return false;
			var self = this;
			editView.model.set(this.model.toJSON()); //set editView's model attributes => will trigger render() on the editView
			
			self.$el.fadeOut(200, function () {
				self.$el.after(editView.el);
				editView.show();
			});

			return false;
		},
		deleted: function () { this.remove(); }, //removes itself from the DOM, when a deletion occurs in the editView
		cancelled: function () { this.$el.fadeIn(200); } //shows itself again, when an edit is cancelled
	});

	//ListView is responsible for managing the item collection, item views, and the editView
	var ListView = Backbone.View.extend({
		el: $(".crudContainer"),
		listContainer: null,
		noItemsContainer: null,
		editing: false,
		collection: Namespace.CRUD.ItemCollection,
		events: { "click .actionAdd": "addNew" },
		initialize: function () {
			_.bindAll(this, "saved");
			this.bindContainers();
			this.bindCollection();
			this.bindEditModel();
			this.bindEditView();
			this.render();
		},
		bindContainers: function () {
			this.listContainer = this.$el.find("ul.listContainer");
			this.noItemsContainer = this.$el.find(".noItemsContainer");
		},
		bindCollection: function () {
			this.collection.on("add", this.addedToCollection, this);
			this.collection.on("remove", this.removedFromCollection, this);
		},
		bindEditModel: function() {
			editModel = new Namespace.CRUD.ItemModel;
			editModel.on("deleted", this.deleted, this);
			editModel.on("cancelled", this.cancelled, this);
			editModel.on("saved", this.saved, this);
			editModel.on("editStart", this.editStart, this);
			editModel.on("editEnd", this.editEnd, this);
		},
		bindEditView: function () {
			editView = new Namespace.CRUD.EditView({ model: editModel });
		},
		editStart: function() {
			editing = true;
			this.$el.find(".actionAdd, .actionEdit").addClass("disabled");
		},
		editEnd: function() {
			editing = false;
			this.$el.find(".actionAdd, .actionEdit").removeClass("disabled");
		},
		render: function () {
			var self = this;
			self.collection.each(function (itemModel) {
				self.renderItemView(itemModel);
			});
		},
		renderItemView: function (itemModel) {
			var el = new ItemView({ model: itemModel }).render().hide();

			if (itemModel.get("IsNew")) {
				this.listContainer.prepend(el); //added to start of the list
				itemModel.set("IsNew", false); 
			} else this.listContainer.append(el); //added to the end of the list

			el.fadeIn(200);
		},
		addNew: function () {
			if (editing) return false;
			var newModel = new Namespace.CRUD.ItemModel;
			editView.model.set(newModel.toJSON());
			this.listContainer.prepend(editView.el);

			if (this.noItemsContainer.is(":visible")) this.noItemsContainer.fadeOut(200, editView.show);
			else editView.show();
			
			return false;
		},
		addedToCollection: function (itemModel) {
			this.renderItemView(itemModel);
		},
		deleted: function (id) {
			var itemModel = this.collection.get(id);
			this.collection.remove(itemModel);
			itemModel.trigger("deleted");
		},
		removedFromCollection: function () {
			if (this.collection.isEmpty()) this.noItemsContainer.fadeIn(200);
		},
		cancelled: function (id) {
			var itemModel = this.collection.get(id);
			if (itemModel) itemModel.trigger("cancelled");
			else if (this.collection.isEmpty()) this.noItemsContainer.fadeIn(200);
		},
		saved: function (model) {
			var oldModel = this.collection.get(model.id);
			var isNew = !oldModel; //if a model with the returned "id" is not in the collection, then it is new
			var newModel = new Namespace.CRUD.ItemModel(model.attributes); //new model returned from server

			if (isNew) {
				var newId = _.max(this.collection.models, function(mdl) { return mdl.id; }).id + 1;
				newModel.set("id", newId);
				newModel.set("IsNew", true);
				this.collection.add(newModel);
			} else oldModel.set(newModel.toJSON()); //will trigger renderAndShow() on the item view
		}
	});
		
	var listView = new ListView({ collection: new Namespace.CRUD.ItemCollection(options.data) });
});