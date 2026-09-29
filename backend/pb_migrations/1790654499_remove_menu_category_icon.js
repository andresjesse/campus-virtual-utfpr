migrate((app) => {
  const collection = app.findCollectionByNameOrId("menu_categories");

  collection.fields.removeById("file1704208859");

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("menu_categories");

  // Restored at its original position, before the autodate fields.
  collection.fields.addAt(2, new FileField({
    id: "file1704208859",
    name: "icon",
    hidden: false,
    maxSelect: 1,
    maxSize: 0,
    mimeTypes: ["image/svg+xml", "image/png", "image/jpeg"],
    presentable: false,
    protected: false,
    // Rolling back can't recover the removed files, so the field returns optional
    // to keep already stored categories valid.
    required: false,
    system: false,
    thumbs: [],
  }));

  return app.save(collection);
});
