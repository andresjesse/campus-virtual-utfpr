import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/tiptap/styles.css';
import "./globals.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import ReactDOM from "react-dom/client";

import { theme } from "@/theme";
import { applyBranding } from "@/config/apply-branding";
import { branding } from "@/config/branding";

import { Router } from "./router";
import ProvidersGroup from "@/components/ProvidersGroup.tsx";

const root = document.getElementById("root");

document.body.style.background = import.meta.env.VITE_BRAND_LOADING_COLOR;

applyBranding(branding);

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
