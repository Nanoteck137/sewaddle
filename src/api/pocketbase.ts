import PocketBase from "pocketbase";

// TODO(patrik): Change URL to env variable
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_BASE_URL);
