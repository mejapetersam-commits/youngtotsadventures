// Vercel catch-all serverless function for every request under /api/*.
// The Express app (artifacts/api-server/src/app.ts) already mounts all of
// its routes under an "/api" prefix internally (app.use("/api", router)),
// so we hand it the request completely unmodified — no path rewriting
// needed here.
//
// Note: we import app.ts directly, NOT index.ts — index.ts calls
// app.listen(port) at module load time, which only makes sense for a
// long-running server (e.g. local dev or Replit) and must never run in a
// serverless function.
import type { IncomingMessage, ServerResponse } from "http";
import expressApp from "../artifacts/api-server/src/app";

// Express apps are runtime-callable RequestListener functions
// ((req, res) => void), but in Vercel's isolated per-function build,
// TypeScript sometimes resolves the Express app's type without its call
// signature (a type-resolution quirk, not a runtime issue). Casting through
// `unknown` sidesteps that regardless of which Express type declaration
// gets picked up during that isolated build.
const app = expressApp as unknown as (req: IncomingMessage, res: ServerResponse) => void;

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
