import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  const app = createApp();

  try {
    await prisma.$connect();
    logger.info("Database connection established");
  } catch (err) {
    logger.error("Failed to connect to the database", {
      message: (err as Error).message,
    });
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`HMS API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Cleanup complete. Bye.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
