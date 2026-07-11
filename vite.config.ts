import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Helper to parse and load .env files into process.env
function loadDotEnv(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const index = trimmed.indexOf('=');
          if (index !== -1) {
            const key = trimmed.substring(0, index).trim();
            let val = trimmed.substring(index + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.substring(1, val.length - 1);
            }
            process.env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    console.error(`Failed to load ${filePath}:`, err);
  }
}

// Load environment variables from .env, .env.local, and vercel.json
loadDotEnv(path.resolve(process.cwd(), '.env'));
loadDotEnv(path.resolve(process.cwd(), '.env.local'));

try {
  const vercelJsonPath = path.resolve(process.cwd(), 'vercel.json');
  if (fs.existsSync(vercelJsonPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
    if (vercelConfig && vercelConfig.env) {
      for (const [key, val] of Object.entries(vercelConfig.env)) {
        if (val) {
          process.env[key] = val as string;
        }
      }
    }
  }
} catch (err) {
  console.error('Failed to load environment variables from vercel.json:', err);
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  // Add Serverless API Handler emulation middleware
  const apiMiddlewarePlugin = {
    name: 'api-serverless-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/')) {
          const url = new URL(req.url, 'http://localhost');
          const routeName = url.pathname.replace(/^\/api\//, '');
          const parts = routeName.split('/');
          
          let apiFile = '';
          const exactPath = path.resolve(process.cwd(), 'api', `${routeName}.js`);
          if (fs.existsSync(exactPath)) {
            apiFile = exactPath;
          } else if (parts.length >= 2) {
            const dynamicPath = path.resolve(process.cwd(), 'api', parts[0], '[id].js');
            if (fs.existsSync(dynamicPath)) {
              apiFile = dynamicPath;
            }
          }
          if (!apiFile) {
            const segmentPath = path.resolve(process.cwd(), 'api', `${parts[0]}.js`);
            if (fs.existsSync(segmentPath)) {
              apiFile = segmentPath;
            }
          }

          if (apiFile) {
            try {
              const fileUrl = pathToFileURL(apiFile).href;
              const module = await import(fileUrl + '?t=' + Date.now());
              const handler = module.default;

              // Parse query parameters
              req.query = Object.fromEntries(url.searchParams.entries());
              if (parts.length >= 2 && !req.query.id) {
                req.query.id = parts[1];
              }

              // Add Express/Vercel status helper
              res.status = (code: number) => {
                res.statusCode = code;
                return res;
              };

              // Add Express/Vercel json helper
              res.json = (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              // Parse body for mutations
              if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
                let body = '';
                req.on('data', (chunk: any) => {
                  body += chunk;
                });
                req.on('end', async () => {
                  try {
                    req.body = body ? JSON.parse(body) : {};
                  } catch (e) {
                    req.body = body;
                  }
                  try {
                    await handler(req, res);
                  } catch (err: any) {
                    console.error('API Handler Execution Error:', err);
                    if (!res.headersSent) {
                      res.status(500).json({ error: err.message });
                    }
                  }
                });
              } else {
                await handler(req, res);
              }
            } catch (err: any) {
              console.error(`Error loading API handler: ${apiFile}`, err);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            }
          } else {
            next();
          }
        } else {
          next();
        }
      });
    }
  };

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins: [...plugins, apiMiddlewarePlugin as any],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
          },
        },
      },
    },
  };
})
