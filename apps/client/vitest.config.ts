import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    // Bolder fork: @/lib/config imports @docmost/editor-ext, which imports docx, and that touches
    // localStorage at import time, so Node prints an ExperimentalWarning in each worker.
    execArgv: ['--disable-warning=ExperimentalWarning'],
  },
});
