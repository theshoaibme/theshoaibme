import { execFileSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadEnv } from 'vite';
import type { Plugin, UserConfig } from 'vite';

const encryptScript = resolve(__dirname, 'scripts/encrypt-portfolio-data.mjs');
const projectRoot = resolve(__dirname);

function runPortfolioEncryption(mode: string): void {
  const envFromFiles = loadEnv(mode, projectRoot, '');

  execFileSync(process.execPath, [encryptScript], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envFromFiles,
    },
  });
}

function blockPlainPortfolioData(): Plugin {
  return {
    name: 'block-plain-portfolio-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        if (url === '/data.json' || url.endsWith('/data.json')) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Not found');
          return;
        }

        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';

        if (url === '/data.json' || url.endsWith('/data.json')) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        next();
      });
    },
  };
}

export function portfolioDataEncryptionPlugin(): Plugin {
  let mode = 'development';

  return {
    name: 'portfolio-data-encryption',
    config(_config, configEnv) {
      mode = configEnv.mode;
    },
    configResolved() {
      runPortfolioEncryption(mode);
    },
    closeBundle() {
      const distJson = join(resolve(__dirname, 'dist'), 'data.json');

      if (existsSync(distJson)) {
        unlinkSync(distJson);
      }
    },
  };
}

export function dropConsoleInProduction(): Plugin {
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

export { blockPlainPortfolioData };
