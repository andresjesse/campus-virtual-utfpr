migrate((app) => {
  const mesh = app.findCollectionByNameOrId("mesh");

  mesh.listRule = "";
  mesh.viewRule = "";
  mesh.fields.getByName("file").protected = false;

  app.save(mesh);

  const entities = app.findCollectionByNameOrId("entities");

  entities.listRule = "";
  entities.viewRule = "";

  return app.save(entities);
}, (app) => {
  const mesh = app.findCollectionByNameOrId("mesh");

  mesh.listRule = "@request.auth.is_admin = true";
  mesh.viewRule = "@request.auth.is_admin = true";
  mesh.fields.getByName("file").protected = true;

  app.save(mesh);

  const entities = app.findCollectionByNameOrId("entities");

  entities.listRule = '@request.auth.id != ""';
  entities.viewRule = '@request.auth.id != ""';

  return app.save(entities);
});
