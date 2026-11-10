migrate((app) => {
  const entities = app.findCollectionByNameOrId("entities");

  for (const name of ["pos_x", "pos_y", "pos_z", "rotation_x", "rotation_y", "rotation_z"]) {
    entities.fields.getByName(name).required = false;
  }

  return app.save(entities);
}, (app) => {
  const entities = app.findCollectionByNameOrId("entities");

  for (const name of ["pos_x", "pos_y", "pos_z", "rotation_x", "rotation_y", "rotation_z"]) {
    entities.fields.getByName(name).required = true;
  }

  return app.save(entities);
});
