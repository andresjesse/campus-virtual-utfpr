import { BrowserRouter, Route, Routes } from "react-router";

import { Pages } from "@/pages";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pages.Home />} />
        <Route path="/admin" element={<Pages.Admin.Home />} />
      </Routes>
    </BrowserRouter>
  );
};
