import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import plugin from "plugin";
import { resolve, join, dirname } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("develop"),
  },
  server: {
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  plugins: [
    react(),
    plugin({
      shared: ["react", "react/jsx-runtime", "react-dom"],
      remoteEntries: { app2: "http://localhost:3002/expose.js" },
      entry: "./src/main.tsx",
      exposeFile: "./expose.ts",
    }),
  ],
});
