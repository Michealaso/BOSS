import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const apiDir = fileURLToPath(new URL('./api/', import.meta.url));

function nodeResponseAdapter(res) {
  return {
    status(code) { res.statusCode = code; return this; },
    setHeader(name, value) { res.setHeader(name, value); return this; },
    json(payload) {
      if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
      return this;
    },
    end(payload) { res.end(payload); return this; }
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function queryObject(url) {
  const out = {};
  for (const [key, value] of url.searchParams.entries()) out[key] = value;
  return out;
}

const routeMap = new Map([
  ['/api/pesapal-create-payment', './pesapal-create-payment.js'],
  ['/api/pesapal-ipn', './pesapal-ipn.js'],
  ['/api/pesapal-payment-status', './pesapal-payment-status.js'],
  ['/api/pesapal-register-ipn', './pesapal-register-ipn.js'],
  ['/api/admin-order', './admin-order.js'],
  ['/api/chat', './chat.js'],
  ['/api/public-project', './public-project.js']
]);

function localApiPlugin() {
  return {
    name: 'boss-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const target = routeMap.get(url.pathname);
        if (!target) return next();

        try {
          const mod = await import(`${apiDir}${path.sep}${target.replace('./', '')}`);
          const body = req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT'
            ? await readJsonBody(req)
            : {};
          const request = {
            method: req.method,
            headers: req.headers,
            body,
            query: queryObject(url)
          };
          await mod.default(request, nodeResponseAdapter(res));
        } catch (error) {
          console.error(`[BOSS local API] ${url.pathname}`, error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify({ error: error?.message || 'Local API error.' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return {
    plugins: [react(), localApiPlugin()],
    server: { host: true }
  };
});
