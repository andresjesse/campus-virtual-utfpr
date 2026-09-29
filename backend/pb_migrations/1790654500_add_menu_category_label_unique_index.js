migrate((app) => {
  const collection = app.findCollectionByNameOrId("menu_categories");

  collection.indexes = [
    "CREATE UNIQUE INDEX idx_menu_categories_label ON menu_categories (label)",
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("menu_categories");

  collection.indexes = [];

  return app.save(collection);
});
