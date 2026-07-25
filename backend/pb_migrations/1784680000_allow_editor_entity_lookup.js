migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_279067900");

  collection.listRule = '@request.auth.id != ""';
  collection.viewRule = '@request.auth.id != ""';

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_279067900");

  collection.listRule = "@request.auth.is_admin = true";
  collection.viewRule = "@request.auth.is_admin = true";

  return app.save(collection);
});
