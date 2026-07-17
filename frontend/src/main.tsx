import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";

import { AuthenticationProvider } from "@/providers/authentication-provider";

import { Router } from "./router";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <MantineProvider>
    <AuthenticationProvider>
      <Router />
    </AuthenticationProvider>
  </MantineProvider>,
);
