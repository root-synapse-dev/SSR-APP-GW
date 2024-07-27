import { SERVER_PORT } from "./src/utils/config.mjs";
import { CLIENT_PORT } from "./src/utils/config.mjs";
import { NODE_ENV } from "./src/utils/config.mjs";
import { CLIENT_BUILD_PATH } from "./src/utils/config.mjs";
import { SERVER_BUILD_PATH } from "./src/utils/config.mjs";
import { API_PREFIX } from "./src/utils/config.mjs";
import { LOGGING_LEVEL } from "./src/utils/config.mjs";

console.log("SERVER_PORT:", SERVER_PORT);
console.log("CLIENT_PORT:", CLIENT_PORT);
console.log("NODE_ENV:", NODE_ENV);
console.log("Ruta de compilación del cliente:", CLIENT_BUILD_PATH);
console.log("Ruta de compilación del servidor:", SERVER_BUILD_PATH);
console.log("Prefijo de la API:", API_PREFIX);
console.log("Nivel de registro:", LOGGING_LEVEL);
