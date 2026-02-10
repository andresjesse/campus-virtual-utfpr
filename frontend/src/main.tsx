import { MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";

import { Router } from "./router";

import "@mantine/core/styles.css";

const root = document.getElementById("root");

ReactDOM.createRoot(root as any).render(
  <MantineProvider>
    <Router />
  </MantineProvider>,
);
