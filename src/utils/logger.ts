type LogLevel = "info" | "warn" | "error" | "debug";

/**
 * Premium logging service to track server-side operations, errors, and access events.
 */
export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
  },
  info(message: string, meta?: Record<string, any>) {
    this.log("info", message, meta);
  },
  warn(message: string, meta?: Record<string, any>) {
    this.log("warn", message, meta);
  },
  error(message: string, error?: any, meta?: Record<string, any>) {
    const errorMeta = error ? { ...meta, error: error.message || error, stack: error.stack } : meta;
    this.log("error", message, errorMeta);
  },
  debug(message: string, meta?: Record<string, any>) {
    this.log("debug", message, meta);
  }
};
