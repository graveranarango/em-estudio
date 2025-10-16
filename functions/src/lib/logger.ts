import * as functionsLogger from "firebase-functions/logger";

/**
 * Representa el formato estructurado para los registros de auditoría.
 */
interface AuditPayload {
  uid: string;
  role: string;
  action: string;
  resource: {
    type: string;
    id: string;
  };
  status: "success" | "failure";
  endpoint?: string;
  timestamp: string;
}

/**
 * Registro de información general (nivel INFO)
 */
export const info = (message: string, details?: object) => {
  functionsLogger.info(message, details);
};

/**
 * Registro de advertencias (nivel WARN)
 */
export const warn = (message: string, details?: object) => {
  functionsLogger.warn(message, details);
};

/**
 * Registro de errores (nivel ERROR)
 */
export const error = (message: string, err: any, details?: object) => {
  functionsLogger.error(message, {
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    ...details,
  });
};

/**
 * Registro estructurado para auditorías.
 * Se usa una bandera `audit_trail` para filtrar fácilmente en Cloud Logging.
 */
export const audit = (payload: AuditPayload) => {
  functionsLogger.info("Audit Trail Event", {
    audit_trail: true,
    ...payload,
  });
};

const appLogger = { info, warn, error, audit };
export default appLogger;
