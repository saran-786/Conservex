import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const DATA_DIR = path.join(__dirname, "data");
  const DATA_FILE = path.join(DATA_DIR, "usage_data.json");

  // Ensure data directory exists
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating data directory:", err);
  }

  // API Routes
  app.get("/api/usage", async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      // Return fresh default data if file doesn't exist
      res.json({
        electricity: {
          history: [],
          pricePerUnit: 4,
        },
        lpg: {
          lastRefill: new Date().toISOString().split('T')[0],
          usageLevel: "Medium",
        },
        settings: {
          familyMembers: 4,
        }
      });
    }
  });

  app.post("/api/usage", async (req, res) => {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
      res.json({ status: "success" });
    } catch (err) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
