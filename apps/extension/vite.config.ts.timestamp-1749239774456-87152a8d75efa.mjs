// vite.config.ts
import { defineConfig } from "file:///Users/obiabo/Desktop/extensions/rodoh-monorepo/node_modules/.pnpm/vite@5.4.19_@types+node@22.15.29_lightningcss@1.30.1/node_modules/vite/dist/node/index.js";
import react from "file:///Users/obiabo/Desktop/extensions/rodoh-monorepo/node_modules/.pnpm/@vitejs+plugin-react@4.4.1_vite@5.4.19_@types+node@22.15.29_lightningcss@1.30.1_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import webExtension, { readJsonFile } from "file:///Users/obiabo/Desktop/extensions/rodoh-monorepo/node_modules/.pnpm/vite-plugin-web-extension@4.4.3_@types+node@22.15.29_jiti@2.4.2_lightningcss@1.30.1/node_modules/vite-plugin-web-extension/dist/index.js";
import tailwindcss from "file:///Users/obiabo/Desktop/extensions/rodoh-monorepo/node_modules/.pnpm/@tailwindcss+vite@4.1.6_vite@5.4.19_@types+node@22.15.29_lightningcss@1.30.1_/node_modules/@tailwindcss/vite/dist/index.mjs";
function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest
  };
}
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    webExtension({
      manifest: generateManifest
    })
  ],
  server: {
    port: Number(process.env.VITE_PORT) || 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb2JpYWJvL0Rlc2t0b3AvZXh0ZW5zaW9ucy9yb2RvaC1tb25vcmVwby9hcHBzL2V4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29iaWFiby9EZXNrdG9wL2V4dGVuc2lvbnMvcm9kb2gtbW9ub3JlcG8vYXBwcy9leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29iaWFiby9EZXNrdG9wL2V4dGVuc2lvbnMvcm9kb2gtbW9ub3JlcG8vYXBwcy9leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHdlYkV4dGVuc2lvbiwgeyByZWFkSnNvbkZpbGUgfSBmcm9tIFwidml0ZS1wbHVnaW4td2ViLWV4dGVuc2lvblwiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZU1hbmlmZXN0KCkge1xuICBjb25zdCBtYW5pZmVzdCA9IHJlYWRKc29uRmlsZShcInNyYy9tYW5pZmVzdC5qc29uXCIpO1xuICBjb25zdCBwa2cgPSByZWFkSnNvbkZpbGUoXCJwYWNrYWdlLmpzb25cIik7XG4gIHJldHVybiB7XG4gICAgbmFtZTogcGtnLm5hbWUsXG4gICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbixcbiAgICB2ZXJzaW9uOiBwa2cudmVyc2lvbixcbiAgICAuLi5tYW5pZmVzdCxcbiAgfTtcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHRhaWx3aW5kY3NzKCksXG4gICAgd2ViRXh0ZW5zaW9uKHtcbiAgICAgIG1hbmlmZXN0OiBnZW5lcmF0ZU1hbmlmZXN0LFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiBOdW1iZXIocHJvY2Vzcy5lbnYuVklURV9QT1JUKSB8fCA1MTczLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRXLFNBQVMsb0JBQW9CO0FBQ3pZLE9BQU8sV0FBVztBQUNsQixPQUFPLGdCQUFnQixvQkFBb0I7QUFDM0MsT0FBTyxpQkFBaUI7QUFFeEIsU0FBUyxtQkFBbUI7QUFDMUIsUUFBTSxXQUFXLGFBQWEsbUJBQW1CO0FBQ2pELFFBQU0sTUFBTSxhQUFhLGNBQWM7QUFDdkMsU0FBTztBQUFBLElBQ0wsTUFBTSxJQUFJO0FBQUEsSUFDVixhQUFhLElBQUk7QUFBQSxJQUNqQixTQUFTLElBQUk7QUFBQSxJQUNiLEdBQUc7QUFBQSxFQUNMO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQUEsTUFDWCxVQUFVO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTSxPQUFPLFFBQVEsSUFBSSxTQUFTLEtBQUs7QUFBQSxFQUN6QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
