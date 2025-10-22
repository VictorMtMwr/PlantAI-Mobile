import { resolve } from "path";
import { defineConfig } from 'vite';

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        login: resolve(__dirname, "src/pages/login.html"),
        register: resolve(__dirname, "src/pages/register.html"),
        classification: resolve(__dirname, "src/pages/classification.html"),
        historial: resolve(__dirname, "src/pages/historial.html"),
        account: resolve(__dirname, "src/pages/account.html"),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://plantai.lab.utb.edu.co:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});