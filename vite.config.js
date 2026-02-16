import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Phonefoof47863a/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      // three: `/node_modules/three/build/three.module.js`,
      // three: `./node_modules/three/build/three.module.js`,
      // 'superneatlib': '/node_modules/superneatlib/build/superneatlib.js',
      'superneatlib': '/imported_scripts/superneatlib.min.js',
      // 'superneatlib': 'http://localhost:5000/superneatlib.js',
      // 'three': 'three',
      // 'three/examples/jsm/math/' : '/node_modules/three/examples/jsm/math/',
      // '@games': '/games'
    },
  },
}));
