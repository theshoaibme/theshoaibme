import { copyFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin, ProxyOptions, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { SITE_URL } from './src/config/site.ts';

function dropConsoleInProduction(): Plugin {
  return {
    name: 'drop-console-in-production',
    apply: 'build',
    config() {
      return {
        build: {
          rolldownOptions: {
            output: {
              minify: {
                compress: {
                  dropConsole: true,
                  dropDebugger: true,
                },
              },
            },
          },
        },
      } as UserConfig;
    },
  };
}

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'theshoaibme.github.io';
const isUserPage = repoName.endsWith('.github.io');
const base = isUserPage ? '/' : `/${repoName}/`;

const devCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self' blob: 'unsafe-inline'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
  "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net data:",
  "img-src 'self' data: https:",
  "connect-src 'self' ws: wss: http://localhost:5173 http://127.0.0.1:5173 https://api.telegram.org https://github-contributions-api.jogruber.de",
].join('; ');

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
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
    tailwindcss(),
    react(),
    dropConsoleInProduction(),
    {
      name: 'dev-csp-relax',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace(
          /http-equiv="Content-Security-Policy"\s+content="[^"]+"/,
          `http-equiv="Content-Security-Policy" content="${devCsp}"`,
        );
      },
    },
    {
      name: 'github-pages-spa-fallback',
      closeBundle() {
        const distDir = resolve(import.meta.dirname, 'dist');
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
