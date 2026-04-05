import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { ensureSchema } from "./ensureSchema.js";

const app = express();

// 10mb limit for base64 image uploads (flyers & merch)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(JSON.stringify({ method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start }));
  });
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "playbetter-api", env: process.env.NODE_ENV || "development", ts: new Date().toISOString() });
});
app.get("/health", (_req, res) => res.json({ ok: true }));

registerRoutes(app);

app.use("/api", (_req, res) => { res.status(404).json({ error: "Not found" }); });

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  console.error(err);
  res.status(status).json({ error: err?.message || "Internal Server Error" });
});

const port = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await ensureSchema();
    console.log("✓ Database schema ready");
  } catch (e) {
    console.error("Schema ensure failed:", e);
    process.exit(1);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`PlayBetter API listening on :${port}`);
  });
})();
