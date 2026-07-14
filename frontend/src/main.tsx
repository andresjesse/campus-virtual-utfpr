import { MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";

import { Router } from "./router";

import "@mantine/core/styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <MantineProvider>
    <Router />
  </MantineProvider>,
);
