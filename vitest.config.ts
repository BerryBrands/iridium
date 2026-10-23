import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { scopedName } from './scripts/scopedName.js';

export default defineConfig({
  plugins: [react()],
  css: { modules: { generateScopedName: scopedName } },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: { include: ['src/**'], reporter: ['text', 'lcov'] },
  },
});
