import ContentPageEditorPage from "@/pages/admin/content-pages/editor/ContentPageEditorPage.tsx";
import ContentPageList from "@/pages/admin/content-pages/list/ContentPageListPage.tsx";
import EntityEditorPage from "@/pages/admin/entities/editor/EntityEditorPage.tsx";
import EntityListPage from "@/pages/admin/entities/list/EntityListPage.tsx";
import MeshEditorPage from "@/pages/admin/meshes/editor/MeshEditorPage.tsx";
import MeshListPage from "@/pages/admin/meshes/list/MeshListPage.tsx";
import AdminPlaceholder from "@/pages/admin/placeholder";

export const Admin = {
  ContentPageEditor: ContentPageEditorPage,
  ContentPageList,
  EntityEditor: EntityEditorPage,
  EntityList: EntityListPage,
  MeshEditor: MeshEditorPage,
  MeshList: MeshListPage,
  Placeholder: AdminPlaceholder,
};
