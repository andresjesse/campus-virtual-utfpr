import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  preview: {
    port: 3000,
    strictPort: true,
    // Mesma origem do PocketBase nos testes de carregamento (como em produção): sem isso, os
    // arquivos .glb vêm de outra origem e o navegador oculta o tamanho deles nos registros de tempo.
    proxy: {
      "/api": { target: "http://127.0.0.1:8080", changeOrigin: true },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
});
