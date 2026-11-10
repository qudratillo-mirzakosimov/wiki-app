import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

const envPath = path.resolve(process.cwd(), "..", "..");

export default defineConfig(({ mode }) => {
  const {
    APP_URL,
    FILE_UPLOAD_SIZE_LIMIT,
    FILE_IMPORT_SIZE_LIMIT,
    DRAWIO_URL,
    CLOUD,
    SUBDOMAIN_HOST,
    COLLAB_URL,
    BILLING_TRIAL_DAYS,
    POSTHOG_HOST,
    POSTHOG_KEY,
    APP_NAME,
    SOURCE_CODE_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_ALLOWED_DOMAINS,
  } = loadEnv(mode, envPath, "");

  return {
    define: {
      "process.env": {
        APP_URL,
        FILE_UPLOAD_SIZE_LIMIT,
        FILE_IMPORT_SIZE_LIMIT,
        DRAWIO_URL,
        CLOUD,
        SUBDOMAIN_HOST,
        COLLAB_URL,
        BILLING_TRIAL_DAYS,
        POSTHOG_HOST,
        POSTHOG_KEY,
        APP_NAME,
        SOURCE_CODE_URL,
        // Only the on/off flag reaches the browser, never the Google credentials.
        GOOGLE_AUTH_ENABLED: String(
          Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_ALLOWED_DOMAINS),
        ),
      },
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    plugins: [
      react(),
      // Bolder fork: production replaces __APP_NAME__ at server boot (static.module.ts);
      // the dev server has no such step, so do it here.
      {
        name: "bolder-app-name",
        apply: "serve",
        transformIndexHtml: (html: string) =>
          html.replaceAll("__APP_NAME__", APP_NAME || "Bolder Wiki"),
      },
    ],
    build: {
      rolldownOptions: {
        output: {
          advancedChunks: {
            groups: [
              {
                name: "vendor-mantine",
                test: /[\\/]node_modules[\\/]@mantine[\\/]/,
              },
            ],
          },
        },
      },
    },
    resolve: {
      // Bolder fork: Enterprise modules are replaced by open-source shims; this entry
      // must precede "@" or the generic alias would resolve them first.
      alias: [
        { find: /^@\/ee\//, replacement: "/src/oss/ee-shim/" },
        { find: "@", replacement: "/src" },
      ],
    },
    server: {
      proxy: {
        "/api": {
          target: APP_URL,
          changeOrigin: false,
        },
        "/socket.io": {
          target: APP_URL,
          ws: true,
          rewriteWsOrigin: true,
        },
        "/collab": {
          target: APP_URL,
          ws: true,
          rewriteWsOrigin: true,
        },
      },
    },
  };
});
