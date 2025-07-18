import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import analyzer from 'vite-bundle-analyzer';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: {
  //     // '@blueprintjs/icons': path.resolve('./emptyIconPaths.js'),
  //     '@blueprintjs/icons/lib/esm/generated': path.resolve(
  //       './emptyIconPaths.js'
  //     ),
  //   },
  // },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'polotno',
      project: 'polotno-studio',
    }),
    analyzer(),
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        converter: path.resolve(__dirname, 'converter.html'),
      },
    },
  },
});
