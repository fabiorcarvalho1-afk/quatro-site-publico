const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8087);
const host = process.env.HOST || "0.0.0.0";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
    if (pathname === "/") pathname = "/index.html";

    const file = path.normalize(path.join(root, pathname));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.stat(file, (statErr, stat) => {
      if (statErr || !stat.isFile()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(file).toLowerCase();
      const contentType = types[ext] || "application/octet-stream";
      const range = req.headers.range;
      const cacheControl =
        ext === ".mp4" || ext === ".webm" ? "public, max-age=86400" : "no-store, max-age=0";

      // Mobile Safari often requires Range requests for MP4 playback.
      if (range && (ext === ".mp4" || ext === ".webm")) {
        const m = /^bytes=(\d+)-(\d*)$/i.exec(range);
        if (!m) {
          res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
          res.end();
          return;
        }

        const start = Number(m[1]);
        const end = m[2] ? Number(m[2]) : stat.size - 1;
        if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= stat.size) {
          res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
          res.end();
          return;
        }

        res.writeHead(206, {
          "Content-Type": contentType,
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(end - start + 1),
          "Cache-Control": cacheControl,
        });

        fs.createReadStream(file, { start, end }).pipe(res);
        return;
      }

      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
        "Accept-Ranges": "bytes",
        // Avoid aggressive caching during local development so layout/CSS fixes show up immediately.
        "Cache-Control": cacheControl,
      });

      fs.createReadStream(file).pipe(res);
    });
  })
  .listen(port, host, () => {
    console.log(`Local server listening on http://${host}:${port}/`);
    console.log(`Open on this PC: http://127.0.0.1:${port}/index.html`);
  });
