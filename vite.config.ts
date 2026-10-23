import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };

const external = [...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)];

export default defineConfig({
  plugins: [react()],
  css: {
    // Stable, prefixed class names, so a host can read the DOM and override a rule without a hash in the selector.
    modules: { generateScopedName: 'ir-[local]' },
  },
  build: {
    lib: {
      entry: { index: 'src/index.ts', 'react-router': 'src/react-router.tsx' },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
      cssFileName: 'styles',
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: (id) => external.some((name) => id === name || id.startsWith(`${name}/`)),
    },
  },
});
