import { resolve } from "path";

export const API_PREFIX = "/api";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const SERVER_PORT = process.env.PORT || 3000;
export const CLIENT_PORT = process.env.PORT || 9000;
export const SERVER_BUILD_PATH = resolve(process.cwd(), "build/server");
export const CLIENT_BUILD_PATH = resolve(process.cwd(), "build/client");
export const LOG_DIRECTORY = resolve(process.cwd(), "logs");
export const LOGGING_LEVEL = process.env.LOGGING_LEVEL || "info";
