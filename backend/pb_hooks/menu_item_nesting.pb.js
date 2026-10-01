// A nested menu item belongs to the same category as its parent. The admin form
// only offers same-category parents, but the collection rules allow any
// authenticated write, so the invariant is enforced here as well.
//
// These are model hooks rather than *Request ones so that they also cover writes
// that don't come from the API, such as the PocketBase dashboard.
//
// The cascade below is not atomic with the record's own update: event.next()
// commits before it runs.
//
// Everything lives inside the handler on purpose: PocketBase runs each hook in
// its own context, where file-scope helpers are not visible.
function enforceMenuItemNesting(event) {
  const menuItem = event.record;
  const parentId = menuItem.getString("parent");
  const category = menuItem.getString("category");

  if (parentId) {
    const parent = event.app.findRecordById("menu_items", parentId);

    if (parent.getString("category") !== category) {
      throw new BadRequestError(
        "Um item aninhado deve pertencer à mesma categoria do item pai.",
      );
    }
  }

  const previousCategory = menuItem.original().getString("category");

  event.next();

  if (!previousCategory || previousCategory === category) return;

  event.app
    .findRecordsByFilter("menu_items", "parent = {:parent}", "", 0, 0, {
      parent: menuItem.id,
    })
    .forEach((child) => {
      child.set("category", category);
      event.app.save(child);
    });
}

onRecordCreate(enforceMenuItemNesting, "menu_items");
onRecordUpdate(enforceMenuItemNesting, "menu_items");
