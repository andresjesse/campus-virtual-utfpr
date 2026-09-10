migrate((app) => {
  const collection = app.findCollectionByNameOrId("mesh");

  collection.indexes = [
    "CREATE UNIQUE INDEX idx_mesh_name ON mesh (name)",
  ];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("mesh");

  collection.indexes = [];

  return app.save(collection);
});