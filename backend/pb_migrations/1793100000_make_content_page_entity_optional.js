migrate((app) => {
  const contentPage = app.findCollectionByNameOrId("content_page");

  contentPage.fields.getByName("entity").required = false;
  contentPage.indexes = [
    "CREATE UNIQUE INDEX idx_content_page_entity ON content_page (entity) WHERE entity != ''",
  ];

  return app.save(contentPage);
}, (app) => {
  const contentPage = app.findCollectionByNameOrId("content_page");

  contentPage.fields.getByName("entity").required = true;
  contentPage.indexes = [];

  return app.save(contentPage);
});
