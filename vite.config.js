import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Phonefoof47863a/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
}));
