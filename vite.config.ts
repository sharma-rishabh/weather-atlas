/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If you fork this repo under a different name, change `base` to '/<repo-name>/'.
// For username.github.io/weather-atlas this is correct as-is.
export default defineConfig({
  plugins: [react()],
  base: '/weather-atlas/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
  },
});
