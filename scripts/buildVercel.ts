/**
 * Produces a static Vercel-ready browser shell that connects to a separately
 * hosted OpenFront game server. Vercel Functions cannot retain the WebSocket
 * connections and in-memory match state required by this game, so the server
 * remains the Docker service included in this repository.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { renderHtmlContent } from "../src/server/RenderHtml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const staticDir = path.join(root, "static");

function requiredHost(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set to your multiplayer server host`);
  if (!/^[a-z0-9.-]+(?::[0-9]+)?$/i.test(value)) {
    throw new Error(`${name} must be a hostname only (no http:// or path)`);
  }
  return value;
}

const serverHost = requiredHost("GAME_SERVER_HOST");

const html = await renderHtmlContent(path.join(staticDir, "index.html"), {
  perServer: false,
  serverHost,
});
await fs.writeFile(path.join(staticDir, "index.html"), html);
console.log(`Built static Vercel shell for game server ${serverHost}`);
