import { Plugin, defineConfig, parseAst } from "vite";
import react from "@vitejs/plugin-react-swc";
import plugin from "plugin";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("develop"),
  },
  server: {
    port: 3002,
  },
  preview: {
    port: 3002,
  },
  plugins: [
    react(),
    plugin({
      shared: ["react", "react/jsx-runtime", "react-dom"],
      remoteEntries: { app1: "http://localhost:3001/expose.js" },
      entry: "./src/main.tsx",
      exposeFile: "./expose.ts",
    }),
  ],
});
