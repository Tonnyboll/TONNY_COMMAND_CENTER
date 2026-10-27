import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JsonStore } from "./core/store.js";
import { TonyCore } from "./core/tony.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const dataFile = process.env.TONY_DATA_FILE || path.join(root, "data", "tony.json");
const port = Number(process.env.PORT || 3030);

const store = await new JsonStore(dataFile).init();
const core = await new TonyCore({ store }).initialize();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error("Request body too large");
  }
  return body ? JSON.parse(body) : {};
}

async function serveStatic(response, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(publicDir, `.${requested}`);
  if (!filePath.startsWith(publicDir)) return false;
  try {
    const content = await fs.readFile(filePath);
    response.writeHead(200, { "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (request.method === "GET" && url.pathname === "/api/health") {
      return sendJson(response, 200, { status: "online", state: "VALIDADO" });
    }
    if (request.method === "GET" && url.pathname === "/api/dashboard") return sendJson(response, 200, core.dashboard());
    if (request.method === "GET" && url.pathname === "/api/projects") return sendJson(response, 200, store.snapshot().projects);
    if (request.method === "GET" && url.pathname === "/api/agents") return sendJson(response, 200, store.snapshot().agents);
    if (request.method === "GET" && url.pathname === "/api/missions") return sendJson(response, 200, store.snapshot().missions);
    if (request.method === "POST" && url.pathname === "/api/messages") {
      const body = await readBody(request);
      return sendJson(response, 200, await core.handleMessage(body));
    }
    if (request.method === "GET" && await serveStatic(response, url.pathname)) return;
    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 400, { error: error.message, state: "FALHOU" });
  }
});

server.listen(port, () => {
  console.log(`T.O.N.Y. Command Center running at http://localhost:${port}`);
});

export { server, core, store };
