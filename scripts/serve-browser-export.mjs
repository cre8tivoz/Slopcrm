// Local-only server for exercising the real export under its deployment prefix.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const root = resolve("out");
const prefix = "/slopcrm/";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (!pathname.startsWith(prefix))
      throw new Error("Not under the export prefix");
    const file = resolve(root, pathname.slice(prefix.length) || "index.html");
    if (!file.startsWith(root + sep)) throw new Error("Not in the export");
    const entry = (await stat(file)).isDirectory()
      ? join(file, "index.html")
      : file;
    const { size } = await stat(entry);
    response.writeHead(200, {
      "Content-Length": size,
      "Content-Type": types[extname(entry)] ?? "application/octet-stream",
    });
    if (request.method === "HEAD") return response.end();
    createReadStream(entry)
      .on("error", () => response.destroy())
      .pipe(response);
  } catch {
    response.writeHead(404).end();
  }
}).listen(Number(process.env.PORT ?? 4173), "127.0.0.1");
