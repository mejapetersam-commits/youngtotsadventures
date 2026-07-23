import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "path";
import fs from "fs";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Serve uploaded payment proofs. On Vercel's serverless filesystem only
// /tmp is writable, and it isn't persistent across invocations — this is a
// known limitation for this deployment target (payment-proof uploads won't
// survive between requests there). Guarded so it can never crash app
// startup regardless of environment.
const uploadsDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/api/uploads", express.static(uploadsDir));
} catch (err) {
  logger.warn({ err }, "Could not set up uploads directory — file serving disabled");
}

app.use("/api", router);

export default app;
