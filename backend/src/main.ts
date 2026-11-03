// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env from the project root (dist/main.js runs from backend/ directory)
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRoutes } from "./presentation/routes/authRoutes";
import { scheduleRoutes } from "./presentation/routes/scheduleRoutes";
import { deadlineRoutes } from "./presentation/routes/deadlineRoutes";
import { ratingRoutes } from "./presentation/routes/ratingRoutes";
import { storyRoutes } from "./presentation/routes/storyRoutes";
import { announcementRoutes } from "./presentation/routes/announcementRoutes";
import { roomRoutes } from "./presentation/routes/roomRoutes";
import { requestRoutes } from "./presentation/routes/requestRoutes";
import { canteenRoutes } from "./presentation/routes/canteenRoutes";
import { userRoutes } from "./presentation/routes/userRoutes";
import { adminRoutes } from "./presentation/routes/adminRoutes";
import { gradeRoutes } from "./presentation/routes/gradeRoutes";
import { houseRoutes } from "./presentation/routes/houseRoutes";
import { boardingRoutes } from "./presentation/routes/boardingRoutes";
import { errorHandlerMiddleware } from "./presentation/middleware/errorHandlerMiddleware";
import { sanitizeInput } from "./presentation/middleware/sanitizationMiddleware";
import { createDatabasePool, closeDatabasePool } from "./infrastructure/config/database";
import { runMigrations } from "./infrastructure/database/migrations/migrationRunner";
import { validateEnvironment } from "./infrastructure/config/validateEnv";
import { corsConfig } from "./infrastructure/config/cors";
import { generalRateLimiter } from "./infrastructure/config/rateLimiter";
import {
  PostgresUserRepository,
  PostgresScheduleRepository,
  PostgresDeadlineRepository,
  PostgresRatingRepository,
  PostgresStoryRepository,
  PostgresAnnouncementRepository,
  PostgresRoomRepository,
  PostgresRequestRepository,
  PostgresCanteenMenuRepository,
  PostgresSubjectRepository,
  PostgresDeadlineNotificationLogRepository,
  PostgresGradeRepository,
  PostgresHouseRepository,
  PostgresBoardingRepository,
} from "./infrastructure/database/postgres";
import { MockNotificationPreferencesRepository } from "./infrastructure/database/memory/MockNotificationPreferencesRepository";
import { MockPushNotificationService } from "./infrastructure/external-services/MockPushNotificationService";
import { ProcessDeadlineNotificationsUseCase } from "./application/deadline/ProcessDeadlineNotificationsUseCase";
import { DeadlineNotificationWorker } from "./application/deadline/DeadlineNotificationWorker";

async function startServer() {
  try {
    console.log("Validating environment configuration...");
    validateEnvironment();

    console.log("Initializing database connection...");
    const pool = await createDatabasePool();

    console.log("Running database migrations...");
    await runMigrations(pool);

    console.log("Creating repository instances...");
    const userRepository = new PostgresUserRepository(pool);
    const scheduleRepository = new PostgresScheduleRepository(pool);
    const deadlineRepository = new PostgresDeadlineRepository(pool);
    const announcementRepository = new PostgresAnnouncementRepository(pool);
    const storyRepository = new PostgresStoryRepository(pool);
    const ratingRepository = new PostgresRatingRepository(pool);
    const roomRepository = new PostgresRoomRepository(pool);
    const requestRepository = new PostgresRequestRepository(pool);
    const canteenMenuRepository = new PostgresCanteenMenuRepository(pool);
    const subjectRepository = new PostgresSubjectRepository(pool);
    const deadlineNotificationLogRepository = new PostgresDeadlineNotificationLogRepository(pool);
    const gradeRepository = new PostgresGradeRepository(pool);
    const houseRepository = new PostgresHouseRepository(pool);
    const boardingRepository = new PostgresBoardingRepository(pool);
    const notificationPreferencesRepository = new MockNotificationPreferencesRepository();
    const pushNotificationService = new MockPushNotificationService();

    const processDeadlineNotificationsUseCase = new ProcessDeadlineNotificationsUseCase(
      deadlineRepository,
      notificationPreferencesRepository,
      deadlineNotificationLogRepository,
      pushNotificationService
    );

    const deadlineNotificationWorker = new DeadlineNotificationWorker(processDeadlineNotificationsUseCase);
    deadlineNotificationWorker.start();

    const app = express();

    // Trust proxy - required for rate limiting behind Nginx
    app.set('trust proxy', true);

    // Security headers
    app.use(helmet({
      contentSecurityPolicy: false, // Disable for API-only backend
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    app.use(cors(corsConfig));

    // General rate limiting
    app.use(generalRateLimiter);

    app.use(express.json());

    // Input sanitization
    app.use(sanitizeInput);

    // Logging middleware
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    // Health check endpoint
    const healthHandler = async (_req: express.Request, res: express.Response) => {
      try {
        await pool.query('SELECT 1');
        res.status(200).json({
          status: 'ok',
          uptime: process.uptime(),
          database: 'connected',
          timestamp: new Date().toISOString(),
          version: '0.2.0',
        });
      } catch (err: any) {
        res.status(503).json({
          status: 'degraded',
          database: 'disconnected',
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      }
    };
    app.get('/health', healthHandler);
    app.get('/api/health', healthHandler);

    // Routes - using PostgreSQL repositories
    app.use("/api/auth", authRoutes(userRepository));
    app.use("/api/users", userRoutes(userRepository, undefined, undefined, scheduleRepository));
    app.use("/api/schedule", scheduleRoutes(scheduleRepository, userRepository));
    app.use("/api/deadlines", deadlineRoutes(deadlineRepository, processDeadlineNotificationsUseCase));
    app.use("/api/ratings", ratingRoutes(ratingRepository));
    app.use("/api/stories", storyRoutes(storyRepository));
    app.use("/api/announcements", announcementRoutes(announcementRepository));
    app.use("/api/rooms", roomRoutes(roomRepository));
    app.use("/api/requests", requestRoutes(requestRepository));
    app.use("/api/canteen", canteenRoutes(canteenMenuRepository));
    app.use("/api/grades", gradeRoutes(gradeRepository, userRepository));
    app.use("/api/houses", houseRoutes(houseRepository));
    app.use("/api/boarding", boardingRoutes(boardingRepository));
    app.use(
      "/api/admin",
      adminRoutes({
        userRepository,
        requestRepository,
        ratingRepository,
        announcementRepository,
        subjectRepository,
        scheduleRepository,
        canteenMenuRepository,
        gradeRepository,
        boardingRepository,
      })
    );

    // Serve static files from admin-web/dist if built
    const adminDistPath = path.join(__dirname, "..", "..", "admin-web", "dist");
    if (fs.existsSync(adminDistPath)) {
      console.log(`Serving Admin Web UI from ${adminDistPath}`);
      app.use(express.static(adminDistPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
          return next();
        }
        res.sendFile(path.join(adminDistPath, "index.html"));
      });
    }

    app.use(errorHandlerMiddleware);

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Using PostgreSQL database at ${process.env.DB_HOST}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\nShutting down gracefully...");
      server.close(async () => {
        await closeDatabasePool();
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
