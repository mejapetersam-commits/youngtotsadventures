// Vercel catch-all serverless function for every request under /api/*.
// The Express app (artifacts/api-server/src/app.ts) already mounts all of
// its routes under an "/api" prefix internally (app.use("/api", router)),
// so we hand it the request completely unmodified — no path rewriting
// needed here.
//
// We import the pre-bundled dist/app.mjs (built by esbuild via
// artifacts/api-server/build.mjs), not the raw TypeScript source. Vercel's
// own per-function build only transpiles the entry file it's given; it
// doesn't bundle/inline relative imports crossing package boundaries in
// this monorepo, which left them unresolved at runtime. Importing the
// already-bundled, self-contained output sidesteps that entirely — see
// build.mjs for the second "src/app.ts" entry point that produces it.
//
// Note: index.mjs (the OTHER bundle produced by the same build) calls
// app.listen(port) at module load time, which only makes sense for a
// long-running server (local dev / Replit) and must never run in a
// serverless function — that's why app.mjs (a separate bundle with no
// listen() call) exists and is what we import here.
import type { IncomingMessage, ServerResponse } from "http";
import expressApp from "../artifacts/api-server/dist/app.mjs";

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
