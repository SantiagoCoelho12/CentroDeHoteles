import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('out');
const base = process.env.PAGES_BASE_PATH ?? '/CentroDeHoteles';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/' || url.pathname === base) { res.writeHead(302, { Location: `${base}/` }); res.end(); return; }
    const pathname = decodeURIComponent(url.pathname);
    if (!pathname.startsWith(`${base}/`)) { res.writeHead(404); res.end(); return; }
    let file = path.resolve(root, `.${pathname.slice(base.length)}`);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' }); res.end(content);
  } catch { res.writeHead(404); res.end('No encontrado'); }
}).listen(4174, '127.0.0.1', () => console.log(`Demo de Pages: http://localhost:4174${base}/`));
