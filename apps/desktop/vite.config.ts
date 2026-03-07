import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";

const webHttpsEnabled = process.env.ARIA_WEB_HTTPS === "true";
const webCertFile = process.env.ARIA_WEB_CERT_FILE || "";
const webKeyFile = process.env.ARIA_WEB_KEY_FILE || "";
const apiProxyTarget = process.env.ARIA_VITE_API_PROXY_TARGET || "http://127.0.0.1:8787";
const canUseHttps =
  webHttpsEnabled
  && !!webCertFile
  && !!webKeyFile
  && fs.existsSync(webCertFile)
  && fs.existsSync(webKeyFile);
const httpsConfig = canUseHttps
  ? {
    cert: fs.readFileSync(webCertFile),
    key: fs.readFileSync(webKeyFile)
  }
  : false;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    port: 1420,
    strictPort: true,
    https: httpsConfig,
    proxy: {
      "/v1": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false
      },
      "/health": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false
      },
      "/fun": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    https: httpsConfig
  }
});
