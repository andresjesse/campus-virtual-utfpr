// `menu_items.parent` lets an item be nested under another one. Without the
// cascade, deleting a parent would leave its children pointing at a dead id,
// since the relation is optional and PocketBase would not clear it.
const PARENT_FIELD = {
  id: "relation1032740943",
  name: "parent",
  collectionId: "pbc_2382559930",
  hidden: false,
  maxSelect: 1,
  minSelect: 0,
  presentable: false,
  required: false,
  system: false,
};

migrate((app) => {
  const collection = app.findCollectionByNameOrId("menu_items");

  collection.fields.addAt(5, new RelationField({
    ...PARENT_FIELD,
    cascadeDelete: true,
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("menu_items");

  collection.fields.addAt(5, new RelationField({
    ...PARENT_FIELD,
    cascadeDelete: false,
  }));

  return app.save(collection);
});
