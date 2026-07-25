function validateContentPageRelation(event) {
  const page = event.record;
  const pageId = page ? page.getString("id") : "";
  const menuItems = pageId
      ? event.app.findRecordsByFilter(
          "menu_items",
          "page = {:page}",
          "",
          1,
          0,
          {page: pageId},
      )
      : [];

  if (page && page.getString("entity") && menuItems.length > 0) {
    throw new BadRequestError(
      "A página deve estar relacionada a um Modelo 3D ou a um Item de Menu, nunca aos dois.",
    );
  }

  event.next();
}

function validateMenuItemRelation(event) {
  const menuItem = event.record;
  const pageId = menuItem ? menuItem.getString("page") : "";

  if (!pageId) {
    event.next();
    return;
  }

  const page = event.app.findRecordById("content_page", pageId);

  if (page.getString("entity")) {
    throw new BadRequestError(
      "A página já está relacionada a um Modelo 3D.",
    );
  }

  if (
    event.app.findRecordsByFilter(
      "menu_items",
      "page = {:page} && id != {:menuItem}",
      "",
      1,
      0,
      { page: pageId, menuItem: menuItem.getString("id") },
    ).length > 0
  ) {
    throw new BadRequestError(
      "A página já está relacionada a outro Item de Menu.",
    );
  }

  event.next();
}

onRecordCreateRequest(validateContentPageRelation, "content_page");
onRecordUpdateRequest(validateContentPageRelation, "content_page");
onRecordCreateRequest(validateMenuItemRelation, "menu_items");
onRecordUpdateRequest(validateMenuItemRelation, "menu_items");
