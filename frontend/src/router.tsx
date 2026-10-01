import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/authentication-route";
import AuthorizationRoute from "@/components/authorization-route";
import AdminLayout from "@/layouts/admin";
import { Pages } from "@/pages";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pages.Home />} />
        <Route path="/home" element={<Pages.Home />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Pages.Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="pages" replace />} />
            <Route element={<AuthorizationRoute capability="pages.manage" />}>
              <Route path="pages" element={<Pages.Admin.ContentPageList />} />
              <Route path="pages/new" element={<Pages.Admin.ContentPageEditor />} />
              <Route path="pages/:pageId" element={<Pages.Admin.ContentPageEditor />} />
            </Route>
            <Route element={<AuthorizationRoute capability="menu.manage" />}>
              <Route path="menu" element={<Navigate to="categories" replace />} />
              <Route path="menu/items" element={<Pages.Admin.MenuItemList />} />
              <Route path="menu/items/new" element={<Pages.Admin.MenuItemEditor />} />
              <Route path="menu/items/:itemId" element={<Pages.Admin.MenuItemEditor />} />
              <Route path="menu/categories" element={<Pages.Admin.MenuCategoryList />} />
              <Route path="menu/categories/new" element={<Pages.Admin.MenuCategoryEditor />} />
              <Route
                path="menu/categories/:categoryId"
                element={<Pages.Admin.MenuCategoryEditor />}
              />
            </Route>
            <Route element={<AuthorizationRoute capability="entities.manage" />}>
              <Route path="entities" element={<Pages.Admin.EntityList />} />
              <Route path="entities/new" element={<Pages.Admin.EntityEditor />} />
              <Route path="entities/:entityId" element={<Pages.Admin.EntityEditor />} />
            </Route>
            <Route element={<AuthorizationRoute capability="meshes.manage" />}>
              <Route path="meshes" element={<Pages.Admin.MeshList />} />
              <Route path="meshes/new" element={<Pages.Admin.MeshEditor />} />
              <Route path="meshes/:meshId" element={<Pages.Admin.MeshEditor />} />
            </Route>
          </Route>
        </Route>

        <Route path="/*" element={<Pages.FallbackRoutes.NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
