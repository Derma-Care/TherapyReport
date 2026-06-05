// vite.config.js
import { defineConfig } from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/vite-plugin-pwa/dist/index.js";
import removeConsole from "file:///D:/Development/Projects/PhysioCare/Therapist/node_modules/vite-plugin-remove-console/dist/index.mjs";

// src/Constant/Themes.jsx
var COLORS = {
  primary: "#1B4F8A",
  secondary: "#0196ee",
  danger: "#ff4d4f",
  success: "#28a745",
  white: "#fff",
  black: "#7e3a93",
  gray: "#6c757d",
  lowgray: "#6c757d3e",
  teal: "#16a085",
  orange: "#f39c12",
  theme: "#f3f4f7",
  bgcolor: "#a5c4d4ff",
  logocolor: "#000"
};

// vite.config.js
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Therapist App",
        short_name: "Therapist",
        description: "Therapy Booking and Management App",
        theme_color: COLORS.primary,
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/Kinetixwhitelogo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/Kinetixwhitelogo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAic3JjL0NvbnN0YW50L1RoZW1lcy5qc3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEZXZlbG9wbWVudFxcXFxQcm9qZWN0c1xcXFxQaHlzaW9DYXJlXFxcXFRoZXJhcGlzdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcRGV2ZWxvcG1lbnRcXFxcUHJvamVjdHNcXFxcUGh5c2lvQ2FyZVxcXFxUaGVyYXBpc3RcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RldmVsb3BtZW50L1Byb2plY3RzL1BoeXNpb0NhcmUvVGhlcmFwaXN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5cblxuaW1wb3J0IHJlbW92ZUNvbnNvbGUgZnJvbSAndml0ZS1wbHVnaW4tcmVtb3ZlLWNvbnNvbGUnXG5pbXBvcnQgeyBDT0xPUlMgfSBmcm9tICcuL3NyYy9Db25zdGFudC9UaGVtZXMnXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ1RoZXJhcGlzdCBBcHAnLFxuICAgICAgICBzaG9ydF9uYW1lOiAnVGhlcmFwaXN0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGVyYXB5IEJvb2tpbmcgYW5kIE1hbmFnZW1lbnQgQXBwJyxcbiAgICAgICAgdGhlbWVfY29sb3I6IENPTE9SUy5wcmltYXJ5LFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL0tpbmV0aXh3aGl0ZWxvZ28ucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvS2luZXRpeHdoaXRlbG9nby5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9LFxuXG4gICAgICAgIF1cbiAgICAgIH0sIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSAgIC8vIFx1MjcwNSBBREQgVEhJU1xuICAgICAgfSxcbiAgICB9KSxcblxuICAgIHJlbW92ZUNvbnNvbGUoKSxcbiAgXSxcblxuICAvLyBcdTI3MDUgQ09SUkVDVCBQTEFDRVxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIHN0cmljdFBvcnQ6IHRydWVcbiAgfSxcbiAgaG1yOiB7XG4gICAgaG9zdDogJ2xvY2FsaG9zdCcsXG4gICAgcHJvdG9jb2w6ICd3cycsXG4gICAgcG9ydDogMzAwMSxcbiAgfSxcbn0pXG5cbiIsICIvLyBzcmMvc3R5bGVzL2NvbnN0YW50cy50c1xyXG5cclxuZXhwb3J0IGNvbnN0IENPTE9SUyA9IHtcclxuICBwcmltYXJ5OiAnIzFCNEY4QScsXHJcbiAgc2Vjb25kYXJ5OiAnIzAxOTZlZScsXHJcbiAgZGFuZ2VyOiAnI2ZmNGQ0ZicsXHJcbiAgc3VjY2VzczogJyMyOGE3NDUnLFxyXG4gIHdoaXRlOiAnI2ZmZicsXHJcbiAgYmxhY2s6ICcjN2UzYTkzJyxcclxuICBncmF5OiAnIzZjNzU3ZCcsXHJcbiAgbG93Z3JheTogJyM2Yzc1N2QzZScsXHJcbiAgdGVhbDogJyMxNmEwODUnLFxyXG4gIG9yYW5nZTogJyNmMzljMTInLFxyXG4gIHRoZW1lOiAnI2YzZjRmNycsXHJcbiAgYmdjb2xvcjogJyNhNWM0ZDRmZicsXHJcbiAgbG9nb2NvbG9yOiAnIzAwMCcsXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBGT05UX1NJWkVTID0ge1xyXG4gIHhzOiAnMC43NXJlbScsIC8vIDEycHhcclxuICBzbTogJzAuODc1cmVtJywgLy8gMTRweFxyXG4gIGJhc2U6ICcxcmVtJywgLy8gMTZweFxyXG4gIGxnOiAnMS4xMjVyZW0nLCAvLyAxOHB4XHJcbiAgeGw6ICcxLjI1cmVtJywgLy8gMjBweFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgU1BBQ0lORyA9IHtcclxuICB4czogJzRweCcsXHJcbiAgc206ICc4cHgnLFxyXG4gIG1kOiAnMTZweCcsXHJcbiAgbGc6ICcyNHB4JyxcclxuICB4bDogJzMycHgnLFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgU0laRVMgPSB7XHJcbiAgc21hbGw6ICcwLjc1cmVtJyxcclxuICBtZWRpdW06ICcxcmVtJyxcclxuICBsYXJnZTogJzEuMjVyZW0nLFxyXG59XHJcblxyXG4vL3N2ZyBpY29uc1xyXG5leHBvcnQgY29uc3QgY29tcGFyZVN2ZyA9IFtcclxuICAnNTEyIDUxMicsXHJcbiAgYFxyXG4gICAgTTk2IDE2MGgyMjR2NDhIOTZ6TTk2IDMwNGgzMjB2NDhIOTZ6XHJcbiAgICBNMzUyIDk2bDY0IDY0LTY0IDY0LTMyLTMyIDMyLTMyLTMyLTMyelxyXG4gIGAsXHJcbl1cclxuXHJcbmV4cG9ydCBjb25zdCBpbmplY3RUaGVtZSA9ICgpID0+IHtcclxuICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XHJcbiAgT2JqZWN0LmVudHJpZXMoQ09MT1JTKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcclxuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoYC0tY29sb3ItJHtrZXl9YCwgdmFsdWUpXHJcbiAgfSlcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdVLFNBQVMsb0JBQW9CO0FBQzdWLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFHeEIsT0FBTyxtQkFBbUI7OztBQ0huQixJQUFNLFNBQVM7QUFBQSxFQUNwQixTQUFTO0FBQUEsRUFDVCxXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQUEsRUFDUixTQUFTO0FBQUEsRUFDVCxPQUFPO0FBQUEsRUFDUCxPQUFPO0FBQUEsRUFDUCxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsRUFDVCxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsRUFDUixPQUFPO0FBQUEsRUFDUCxTQUFTO0FBQUEsRUFDVCxXQUFXO0FBQ2I7OztBRFRBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWEsT0FBTztBQUFBLFFBQ3BCLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFFRjtBQUFBLE1BQ0Y7QUFBQSxNQUFHLFlBQVk7QUFBQSxRQUNiLFNBQVM7QUFBQTtBQUFBLE1BQ1g7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUVELGNBQWM7QUFBQSxFQUNoQjtBQUFBO0FBQUEsRUFHQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsTUFBTTtBQUFBLElBQ04sVUFBVTtBQUFBLElBQ1YsTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
