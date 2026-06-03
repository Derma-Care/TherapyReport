// vite.config.js
import { defineConfig } from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/vite-plugin-pwa/dist/index.js";
import removeConsole from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/vite-plugin-remove-console/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Therapist App",
        short_name: "Therapist",
        description: "Therapy Booking and Management App",
        theme_color: "#0d6efd",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "./src/assets/Kinetixwhitelogo.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "./src/assets/Kinetixwhitelogo.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      devOptions: {
        enabled: true
        // ✅ ADD THIS
      }
    }),
    removeConsole()
  ],
  // ✅ CORRECT PLACE
  server: {
    port: 3e3,
    strictPort: true
  },
  hmr: {
    host: "localhost",
    protocol: "ws",
    port: 3001
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEZXZlbG9wbWVudFxcXFxQcm9qZWN0c1xcXFxQaHlzaW9DYXJlXFxcXFRoZXJhcGlzdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRGV2ZWxvcG1lbnRcXFxcUHJvamVjdHNcXFxcUGh5c2lvQ2FyZVxcXFxUaGVyYXBpc3RcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RldmVsb3BtZW50L1Byb2plY3RzL1BoeXNpb0NhcmUvVGhlcmFwaXN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5cblxuaW1wb3J0IHJlbW92ZUNvbnNvbGUgZnJvbSAndml0ZS1wbHVnaW4tcmVtb3ZlLWNvbnNvbGUnXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ1RoZXJhcGlzdCBBcHAnLFxuICAgICAgICBzaG9ydF9uYW1lOiAnVGhlcmFwaXN0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGVyYXB5IEJvb2tpbmcgYW5kIE1hbmFnZW1lbnQgQXBwJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMGQ2ZWZkJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy4vc3JjL2Fzc2V0cy9LaW5ldGl4d2hpdGVsb2dvLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy4vc3JjL2Fzc2V0cy9LaW5ldGl4d2hpdGVsb2dvLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICB9LFxuXG4gICAgICAgIF1cbiAgICAgIH0sIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSAgIC8vIFx1MjcwNSBBREQgVEhJU1xuICAgICAgfSxcbiAgICB9KSxcblxuICAgIHJlbW92ZUNvbnNvbGUoKSxcbiAgXSxcblxuICAvLyBcdTI3MDUgQ09SUkVDVCBQTEFDRVxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIHN0cmljdFBvcnQ6IHRydWVcbiAgfSxcbiAgaG1yOiB7XG4gICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJvdG9jb2w6ICd3cycsXG4gICAgcG9ydDogMzAwMSxcbiAgfSxcbn0pXG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1UsU0FBUyxvQkFBb0I7QUFDN1YsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUd4QixPQUFPLG1CQUFtQjtBQUMxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFFBRUY7QUFBQSxNQUNGO0FBQUEsTUFBRyxZQUFZO0FBQUEsUUFDYixTQUFTO0FBQUE7QUFBQSxNQUNYO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFFRCxjQUFjO0FBQUEsRUFDaEI7QUFBQTtBQUFBLEVBR0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
