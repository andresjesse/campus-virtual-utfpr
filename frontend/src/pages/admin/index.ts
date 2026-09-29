import ContentPageEditorPage from "@/pages/admin/content-pages/editor/ContentPageEditorPage.tsx";
import ContentPageList from "@/pages/admin/content-pages/list/ContentPageListPage.tsx";
import EntityEditorPage from "@/pages/admin/entities/editor/EntityEditorPage.tsx";
import EntityListPage from "@/pages/admin/entities/list/EntityListPage.tsx";
import MenuCategoryEditorPage from "@/pages/admin/menu/categories/editor/MenuCategoryEditorPage.tsx";
import MenuCategoryListPage from "@/pages/admin/menu/categories/list/MenuCategoryListPage.tsx";
import MenuItemListPage from "@/pages/admin/menu/items/MenuItemListPage.tsx";
import MeshEditorPage from "@/pages/admin/meshes/editor/MeshEditorPage.tsx";
import MeshListPage from "@/pages/admin/meshes/list/MeshListPage.tsx";

export const Admin = {
  ContentPageEditor: ContentPageEditorPage,
  ContentPageList,
  EntityEditor: EntityEditorPage,
  EntityList: EntityListPage,
  MenuCategoryEditor: MenuCategoryEditorPage,
  MenuCategoryList: MenuCategoryListPage,
  MenuItemList: MenuItemListPage,
  MeshEditor: MeshEditorPage,
  MeshList: MeshListPage,
};
