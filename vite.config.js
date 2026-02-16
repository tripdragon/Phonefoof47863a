import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Phonefoof47863a/" : "/",
}));
