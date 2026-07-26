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
              <Route
                path="menu-items"
                element={<Pages.Admin.Placeholder title="Itens e Categorias do Menu" />}
              />
            </Route>
            <Route element={<AuthorizationRoute capability="entities.manage" />}>
              <Route
                path="entities"
                element={<Pages.Admin.Placeholder title="Entidades 3D" />}
              />
            </Route>
            <Route element={<AuthorizationRoute capability="meshes.manage" />}>
              <Route
                path="meshes"
                element={<Pages.Admin.Placeholder title="Arquivos Mesh" />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="/*" element={<Pages.FallbackRoutes.NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
