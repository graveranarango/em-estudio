import { setGlobalOptions } from "firebase-functions/v2/options";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Control de costos
setGlobalOptions({ maxInstances: 10 });

/**
 * Función principal (pública) para producción.
 * Hacemos la función pública con invoker:"public" para evitar el 403 Forbidden.
 */
export const makeServerEcf7df64 = onRequest({ invoker: "public" }, (req, res) => {
  logger.info("✅ make-server-ecf7df64 ejecutada (producción)");
  res.status(200).json({
    status: "success",
    message: "Servidor de EM Estudio activo en PRODUCCIÓN ✅",
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});
