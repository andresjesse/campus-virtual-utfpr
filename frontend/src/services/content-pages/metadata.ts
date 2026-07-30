import { pocketbase } from "@/services/pocketbase.ts";
import type {
  ContentPageFormValues,
  ContentPageListRecord,
  ContentPageRecord,
  EntityRecord,
  MenuItemRecord,
  RelatedOption,
  RelatedType,
} from "@/types/content-page.ts";
import {PAGE_BLOCK_COLLECTIONS} from "@/constants/content-constants.ts";

const CONTENT_PAGES_COLLECTION = "content_page";
const ENTITIES_COLLECTION = "entities";
const MENU_ITEMS_COLLECTION = "menu_items";

function encodeRelation(type: RelatedType, id: string) {
  return `${type}:${id}`;
}

function parseRelation(relation: string) {
  const separator = relation.indexOf(":");

  if (separator < 1) {
    throw new Error("Selecione um elemento relacionado válido.");
  }

  return {
    id: relation.slice(separator + 1),
    type: relation.slice(0, separator) as RelatedType,
  };
}

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

export function getContentPageErrorMessage(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return "Não foi possível concluir a operação. Tente novamente.";
  }

  const response =
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null
      ? error.response
      : null;
  const responseMessage =
    response &&
    "message" in response &&
    typeof response.message === "string"
      ? response.message.trim()
      : "";

  if (
    responseMessage &&
    /[áàâãéêíóôõúç]|\b(página|modelo|item|relacionad[ao])\b/i.test(
      responseMessage,
    )
  ) {
    return responseMessage;
  }

  const status =
    "status" in error && typeof error.status === "number" ? error.status : 0;

  if (status === 400) {
    return "Verifique os dados informados e tente novamente.";
  }

  if (status === 401) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (status === 403) {
    return "Você não tem permissão para alterar esta página.";
  }

  if (status === 404) {
    return "A página ou o elemento relacionado não foi encontrado.";
  }

  if (status >= 500) {
    return "O servidor não conseguiu salvar a página. Tente novamente mais tarde.";
  }

  return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
}
