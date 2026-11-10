const BLOCK_COLLECTIONS = ["rtf_block", "file_block", "diagram_block"];

migrate((app) => {
  for (const name of BLOCK_COLLECTIONS) {
    const collection = app.findCollectionByNameOrId(name);

    collection.fields.add(new NumberField({
      name: "position",
      onlyInt: true,
      min: 0,
    }));

    app.save(collection);
  }

  const blocksByPage = {};

  for (const name of BLOCK_COLLECTIONS) {
    for (const record of app.findRecordsByFilter(name, "id != ''", "", 0, 0)) {
      const page = record.getString("page");

      (blocksByPage[page] = blocksByPage[page] || []).push({
        record,
        name,
        created: record.getString("created"),
      });
    }
  }

  for (const page of Object.keys(blocksByPage)) {
    blocksByPage[page]
      .sort((a, b) =>
        a.created.localeCompare(b.created)
        || a.name.localeCompare(b.name)
        || a.record.id.localeCompare(b.record.id))
      .forEach(({ record }, index) => {
        record.set("position", index);
        app.save(record);
      });
  }
}, (app) => {
  for (const name of BLOCK_COLLECTIONS) {
    const collection = app.findCollectionByNameOrId(name);

    collection.fields.removeByName("position");

    app.save(collection);
  }
});
