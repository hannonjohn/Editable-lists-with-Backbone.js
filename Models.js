Namespace.CRUD.ItemModel = Backbone.Model.extend();

Namespace.CRUD.ItemCollection = Backbone.Collection.extend({ 
	url: "Controller/Item"
	model: Namespace.CRUD.ItemModel 
});