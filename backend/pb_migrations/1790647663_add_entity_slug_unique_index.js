migrate((app) => {
  const collection = app.findCollectionByNameOrId("entities");

  collection.indexes = [
    "CREATE UNIQUE INDEX idx_entities_slug ON entities (slug)",
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("entities");

  collection.indexes = [];

  return app.save(collection);
});
