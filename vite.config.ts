import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
    "process.env": "{}",
  },
  resolve: {
    alias: {
      events: "events",
      util: "util",
      process: "process/browser",
    },
  },
  optimizeDeps: {
    include: ["events", "util", "process", "firebase/auth", "firebase/app", "firebase/firestore"],
  },
});
