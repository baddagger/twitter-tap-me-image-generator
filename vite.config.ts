import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/twitter-tap-me-image-generator/' : '/'
});
