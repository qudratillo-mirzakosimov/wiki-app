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
    // Bolder fork: @/lib/config pulls in @docmost/editor-ext -> docx, which reads localStorage at
    // import time; Node 25+ prints an ExperimentalWarning for that on every worker. Not ours to fix.
    execArgv: ['--no-warnings'],
  },
});
