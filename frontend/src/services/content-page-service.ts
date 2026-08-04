import {pocketbase} from "@/services/pocketbase.ts";
import type {
  ContentPageBlockMetadata, ContentPageBlockRecord, ContentPageBlockValue,
  ContentPageFormValues,
  ContentPageListRecord,
  ContentPageRecord,
  EntityRecord,
  MenuItemRecord,
  RelatedOption,
} from "@/types/content-page.ts";
import {PAGE_BLOCK_COLLECTIONS} from "@/constants/content-constants.ts";
import {encodeRelation, parseRelation} from "@/helpers/content-pages-service-helper.ts";
import {ContentPageBlocksEnum, type ContentPageBlockType} from "@/enums/content-pages-enum.ts";

// #####################################################################
// #### == #### == #### COLLECTION NAMES #### == #### == #### == #### ==
// #####################################################################

const CONTENT_PAGES_COLLECTION = "content_page";
const ENTITIES_COLLECTION = "entities";
const MENU_ITEMS_COLLECTION = "menu_items";

// #####################################################################
// #### == #### == #### CONTENT PAGES #### == #### == #### == #### == ##
// #####################################################################

async function listPageMenuItems(pageId?: string) {
  return pocketbase
    .collection<MenuItemRecord>(MENU_ITEMS_COLLECTION)
    .getFullList({
      filter: pageId
        ? pocketbase.filter("page = {:page}", { page: pageId })
        : 'page != ""',
      requestKey: null,
      sort: "label",
    });
}

export async function listContentPages(): Promise<ContentPageListRecord[]> {
  const [pages, linkedMenuItems] = await Promise.all([
    pocketbase
      .collection<ContentPageRecord>(CONTENT_PAGES_COLLECTION)
      .getFullList({ expand: "entity", requestKey: null, sort: "-updated" }),
    listPageMenuItems(),
  ]);
  const menuPageIds = new Set(linkedMenuItems.map((item) => item.page));

  return pages.map((page) => ({
    ...page,
    relatedType: page.entity
      ? "entity"
      : menuPageIds.has(page.id)
        ? "menu_item"
        : null,
  }));
}

export async function getContentPageEditorData(id: string) {
  const [page, menuItems] = await Promise.all([
    pocketbase
      .collection<ContentPageRecord>(CONTENT_PAGES_COLLECTION)
      .getOne(id, { expand: "entity", requestKey: null }),
    listPageMenuItems(id),
  ]);

  return {
    page,
    relation: page.entity
      ? encodeRelation("entity", page.entity)
      : menuItems[0]
        ? encodeRelation("menu_item", menuItems[0].id)
        : "",
  };
}

export async function listRelatedOptions(): Promise<RelatedOption[]> {
  const [entities, menuItems] = await Promise.all([
    pocketbase
      .collection<EntityRecord>(ENTITIES_COLLECTION)
      .getFullList({ requestKey: null, sort: "slug" }),
    pocketbase
      .collection<MenuItemRecord>(MENU_ITEMS_COLLECTION)
      .getFullList({ requestKey: null, sort: "label" }),
  ]);

  return [
    ...entities.map((entity) => ({
      label: `Modelo 3D — ${entity.slug || entity.id}`,
      value: encodeRelation("entity", entity.id),
    })),
    ...menuItems.map((item) => ({
      label: `Item de Menu — ${item.label || item.id}`,
      value: encodeRelation("menu_item", item.id),
    })),
  ];
}

async function unlinkMenuItems(pageId: string, exceptId?: string) {
  const linkedItems = await listPageMenuItems(pageId);

  await Promise.all(
    linkedItems
      .filter((item) => item.id !== exceptId)
      .map((item) =>
        pocketbase
          .collection<MenuItemRecord>(MENU_ITEMS_COLLECTION)
          .update(item.id, { page: "" }, { requestKey: null }),
      ),
  );
}

export async function createContentPage(values: ContentPageFormValues) {
  const relation = parseRelation(values.relation);
  const page = await pocketbase
    .collection<ContentPageRecord>(CONTENT_PAGES_COLLECTION)
    .create(
      {
        entity: relation.type === "entity" ? relation.id : "",
        title: values.title,
      },
      { requestKey: null },
    );

  if (relation.type === "menu_item") {
    await pocketbase
      .collection<MenuItemRecord>(MENU_ITEMS_COLLECTION)
      .update(relation.id, { page: page.id }, { requestKey: null });
  }

  return page;
}

export async function updateContentPage(
  id: string,
  values: ContentPageFormValues,
) {
  const relation = parseRelation(values.relation);

  if (relation.type === "entity") {
    await unlinkMenuItems(id);
    return pocketbase
      .collection<ContentPageRecord>(CONTENT_PAGES_COLLECTION)
      .update(id, { entity: relation.id, title: values.title }, { requestKey: null });
  }

  const page = await pocketbase
    .collection<ContentPageRecord>(CONTENT_PAGES_COLLECTION)
    .update(id, { entity: "", title: values.title }, { requestKey: null });
  await unlinkMenuItems(id, relation.id);
  await pocketbase
    .collection<MenuItemRecord>(MENU_ITEMS_COLLECTION)
    .update(relation.id, { page: id }, { requestKey: null });

  return page;
}

export async function deleteContentPage(id: string) {
  await unlinkMenuItems(id);

  for (const collectionName of PAGE_BLOCK_COLLECTIONS) {
    const blocks = await pocketbase.collection(collectionName).getFullList({
      filter: pocketbase.filter("page = {:page}", { page: id }),
      requestKey: null,
    });

    await Promise.all(
      blocks.map((block) =>
        pocketbase
          .collection(collectionName)
          .delete(block.id, { requestKey: null }),
      ),
    );
  }

  await pocketbase
    .collection<ContentPageRecord>(CONTENT_PAGES_COLLECTION)
    .delete(id, { requestKey: null });
}

// #####################################################################
// #### == #### == #### PAGE BLOCKS #### == #### == #### == #### == ####
// #####################################################################

export async function getBlockContent(
  id: string,
  collectionName: ContentPageBlockType
): Promise<ContentPageBlockValue> {
  return await pocketbase
    .collection(collectionName).getOne<ContentPageBlockRecord>(id, {
      fields: "content",
      requestKey: null,
    }).then((data) => { return data.content! })
}

export async function deleteBlockContent(
  id: string,
  collectionName: ContentPageBlockType
): Promise<boolean> {
  return await pocketbase
    .collection(collectionName).delete(id, { requestKey: null });
}

export async function getRtfBlocksMetadata(
  pageId: string,
  withTimestamps: boolean
): Promise<ContentPageBlockMetadata[]> {
  return await pocketbase
    .collection(ContentPageBlocksEnum.RTF_BLOCK).getFullList<ContentPageBlockMetadata>({
      filter: `page="${pageId}"`,
      fields: `id,title,collectionName${withTimestamps ? `,created,updated` : ''}`,
      requestKey: null
    })
}

export async function getDiagramBlocksMetadata(
  pageId: string,
  withTimestamps: boolean
): Promise<ContentPageBlockMetadata[]> {
  return await pocketbase
    .collection(ContentPageBlocksEnum.DIAGRAM_BLOCK).getFullList<ContentPageBlockMetadata>({
      filter: `page="${pageId}"`,
      fields: `id,title,collectionName${withTimestamps ? `,created,updated` : ''}`,
      requestKey: null
    })
}

export async function getFileBlocksMetadata(
  pageId: string,
  withTimestamps: boolean
): Promise<ContentPageBlockMetadata[]> {
  return await pocketbase
    .collection(ContentPageBlocksEnum.FILE_BLOCK).getFullList<ContentPageBlockMetadata>({
      filter: `page="${pageId}"`,
      fields: `id,title,collectionName${withTimestamps ? `,created,updated` : ''}`,
      requestKey: null
    })
}