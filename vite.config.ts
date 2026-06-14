import { copyFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'the-shoaib2.github.io';
const isUserPage = repoName.endsWith('.github.io');
const base = isUserPage ? '/' : `/${repoName}/`;

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
  plugins: [
    react(),
    {
      name: 'github-pages-spa-fallback',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist');
        const indexPath = join(distDir, 'index.html');
        const fallbackPath = join(distDir, '404.html');

        if (existsSync(indexPath)) {
          copyFileSync(indexPath, fallbackPath);
        }
      },
    },
  ],
  base,
});
