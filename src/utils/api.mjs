import express from "express";
import logger from "./logger.mjs";

const router = express.Router();

router.get("/hello", (req, res) => {
  logger.info("API call to /hello");
  res.json({ message: "Hello from the API!" });
});

router.get("/status", (req, res) => {
  logger.info("API call to /status");
  res.json({ status: "API is operational" });
});

router.get("/time", (req, res) => {
  logger.info("API call to /time");
  res.json({ time: new Date().toISOString() });
});

export default router;
