import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { BinaryECUParser } from "./src/services/ecuParser.ts";

const upload = multer({ dest: "uploads/" });
const parser = new BinaryECUParser();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure uploads directory exists
  try {
    await fs.mkdir("uploads", { recursive: true });
  } catch (err) {
    // Ignore if exists
  }

  /**
   * Endpoint to upload ECU files.
   * Receives the file and returns basic metadata.
   */
  app.post("/api/upload-ecu", upload.single("ecu_file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const binaryData = await parser.readBinary(req.file.path);
      
      // Basic heuristic to get some "interesting" bytes for AI analysis
      // We take the first 1KB and some middle parts to help identify the ECU
      const sampleSize = Math.min(binaryData.length, 2048);
      const sample = binaryData.subarray(0, sampleSize).toString('hex');

      res.json({
        message: "File uploaded successfully",
        filename: req.file.originalname,
        size: binaryData.length,
        sample: sample, // Send hex sample for AI analysis on frontend
        tempPath: req.file.path
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Endpoint to extract specific map data based on definitions.
   */
  app.post("/api/extract-map", async (req, res) => {
    try {
      const { tempPath, address, columns, rows, dataType, isSigned, factor } = req.body;
      
      if (!tempPath) return res.status(400).json({ error: "Missing file path" });

      const binaryData = await parser.readBinary(tempPath);
      const mapData = parser.extractMapData(
        binaryData,
        parseInt(address),
        parseInt(columns),
        parseInt(rows),
        dataType,
        isSigned === "true" || isSigned === true,
        parseFloat(factor) || 1.0
      );

      res.json({ data: mapData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tuning-limits", (req, res) => {
    const strategy = req.query.strategy as string;
    const limits: Record<string, any> = {
      "heavy_duty": { boost: { min: 0.5, max: 1.8 }, afr: { min: 12.0, max: 15.0 }, timing: { min: -5, max: 15 } },
      "eco_mode": { boost: { min: 0.0, max: 0.8 }, afr: { min: 14.0, max: 16.0 }, timing: { min: 0, max: 5 } },
      "gasoline": { boost: { min: 0.5, max: 2.2 }, afr: { min: 11.5, max: 14.7 }, timing: { min: 0, max: 20 } },
      "diesel": { boost: { min: 1.0, max: 2.5 }, afr: { min: 14.0, max: 18.0 }, timing: { min: -5, max: 10 } },
      "custom": { boost: { min: 0.0, max: 3.0 }, afr: { min: 10.0, max: 18.0 }, timing: { min: -10, max: 30 } },
    };
    res.json(limits[strategy] || limits["custom"]);
  });

  app.post("/api/impact-report", async (req, res) => {
    try {
      const { boost, afr, timing, strategy } = req.body;
      
      let risk = "LOW";
      if (boost > 2.0 || afr < 11.5 || (afr > 14.0 && boost > 1.5)) risk = "HIGH";
      else if (boost > 1.5 || afr < 12.5) risk = "MEDIUM";

      const hpGain = Math.round((boost - 1.0) * 40 + timing * 1.5);
      const tqGain = Math.round((boost - 1.0) * 55 + timing * 1.0);

      res.json({
        hpGain,
        tqGain,
        risk,
        summary: `Tuning applied with ${risk} risk. Estimated gains: +${hpGain}% HP, +${tqGain}% Torque.`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
