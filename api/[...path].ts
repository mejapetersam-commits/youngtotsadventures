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
import app from "../artifacts/api-server/src/app";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
