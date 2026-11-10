import PocketBase from "pocketbase";

const pocketBaseUrl =
  import.meta.env.VITE_POCKETBASE_URL?.trim() || "http://127.0.0.1:8080";

export const pocketbase = new PocketBase(pocketBaseUrl);
