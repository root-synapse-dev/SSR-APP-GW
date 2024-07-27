import React from "react";
import path from "path";
import cluster from "cluster";
import os from "os";
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import fs from "fs/promises";
import { renderToString } from "react-dom/server";
import App from "../modules/App";
import compression from "compression";
import rateLimit from "express-rate-limit";
import logger from "../utils/logger.mjs";
import apiRouter from "../utils/api.mjs";

import {
  SERVER_PORT,
  CLIENT_BUILD_PATH,
  API_PREFIX,
} from "../utils/config.mjs";

const PORT = SERVER_PORT || 3000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`Proceso maestro ${process.pid} iniciando en puerto ${PORT}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.warn(
      `Worker ${worker.process.pid} murió. Código: ${code}, Señal: ${signal}. Reiniciando...`,
    );
    cluster.fork();
  });

  // Manejo de señales para apagado graceful
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Closing server...");
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill();
    }
    process.exit(0);
  });

  if (process.env.NODE_ENV === "development") {
    import("chokidar").then((chokidar) => {
      chokidar.watch("./src").on("change", () => {
        logger.info("Cambios detectados. Reiniciando workers...");
        for (const id in cluster.workers) {
          cluster.workers[id]?.kill();
        }
      });
    });
  }
} else {
  const app = express();
  const server = createServer(app);

  // Middleware de compresión para todas las respuestas
  app.use(compression());

  // Agregamos rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana por IP
  });
  app.use(limiter);

  // Servir archivos estáticos con caché de 1 día
  app.use(express.static(CLIENT_BUILD_PATH, { maxAge: "1d" }));

  // Caché para SSR
  const ssrCache = new Map();

  // API Routes
  app.use(API_PREFIX, apiRouter);

  // root-route
  app.get("/status", (req: Request, res: Response) => {
    res.status(200).json({ status: "Server is operational" });
  });

  // Ruta Principal de la APP de express
  app.get("*", async (req: Request, res: Response, next: NextFunction) => {
    const key = req.url;

    if (ssrCache.has(key)) {
      return res.send(ssrCache.get(key));
    }

    try {
      const filePath = path.resolve(__dirname, "../client/index.html");
      const htmlData = await fs.readFile(filePath, "utf8");
      const appString = renderToString(<App req={req} />);
      const html = htmlData.replace(
        '<div id="root"></div>',
        `<div id="root">${appString}</div>`,
      );

      ssrCache.set(key, html);
      res.send(html);
    } catch (error) {
      next(error);
    }
  });

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response) => {
    logger.error(err.stack);
    res.status(500).send("Algo salió mal!");
  });

  server.listen(PORT, () => {
    logger.info(`Worker ${process.pid} escuchando en puerto ${PORT}`);
  });
}
