import { BrowserRouter, Route, Routes } from "react-router";

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/authentication-route";
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
          <Route path="/admin" element={<Pages.Admin.Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
