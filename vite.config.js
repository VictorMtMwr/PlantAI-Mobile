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
        about: resolve(__dirname, "src/pages/about.html"),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://plantai.lab.utb.edu.co",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Mantener la ruta completa incluyendo /api
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});