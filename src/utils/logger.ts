type Level = "info" | "warn" | "error" | "debug";

function format(level: Level, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta === undefined) return base;
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return `${base} ${String(meta)}`;
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => console.log(format("info", msg, meta)),
  warn: (msg: string, meta?: unknown) => console.warn(format("warn", msg, meta)),
  error: (msg: string, meta?: unknown) => console.error(format("error", msg, meta)),
  debug: (msg: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(format("debug", msg, meta));
    }
  },
};
