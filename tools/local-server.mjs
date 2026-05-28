import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = process.cwd();
const port = Number(process.argv[2] || process.env.PORT || 8000);
const host = process.argv[3] || process.env.HOST || "127.0.0.1";

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function fileFromUrl(url) {
  const pathname = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const resolved = resolve(root, `.${normalize(requested)}`);
  if (resolved !== root && !resolved.startsWith(root + sep)) return null;
  return resolved;
}

createServer((req, res) => {
  const file = fileFromUrl(req.url || "/");
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "content-type": types.get(extname(file).toLowerCase()) || "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}`);
});
