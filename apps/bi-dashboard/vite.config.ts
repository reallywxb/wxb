import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
const proxyUrl = 'http://192.168.30.69:5000'; // spd药品宿迁环境url

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/spd-bi-api': {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/spd-bi-api/, '/'),
        // cookie
        cookiePathRewrite: {
          '/spd-bi-api': '/',
        },
        target: `${proxyUrl}`,
        ws: true,
      },
    },
  },
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
});
