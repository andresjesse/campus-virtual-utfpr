import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/tiptap/styles.css';

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import ReactDOM from "react-dom/client";

import { theme } from "@/theme";

import { Router } from "./router";
import ProvidersGroup from "@/components/ProvidersGroup.tsx";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <MantineProvider defaultColorScheme="dark" theme={theme}>
    <Notifications />
    <ProvidersGroup>
      <Router />
    </ProvidersGroup>
  </MantineProvider>,
);
