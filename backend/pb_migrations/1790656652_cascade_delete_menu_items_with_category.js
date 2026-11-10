// `menu_items.category` is required, so an item cannot outlive its category.
// Cascading the delete keeps removing a category a single action instead of
// forcing the editor to clear every item that uses it first.
const CATEGORY_FIELD = {
  id: "relation105650625",
  name: "category",
  collectionId: "pbc_1964121896",
  hidden: false,
  maxSelect: 1,
  minSelect: 0,
  presentable: false,
  required: true,
  system: false,
};

migrate((app) => {
  const collection = app.findCollectionByNameOrId("menu_items");

  collection.fields.addAt(6, new RelationField({
    ...CATEGORY_FIELD,
    cascadeDelete: true,
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("menu_items");

  collection.fields.addAt(6, new RelationField({
    ...CATEGORY_FIELD,
    cascadeDelete: false,
  }));

  return app.save(collection);
});
