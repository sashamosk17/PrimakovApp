"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const migrationRunner_1 = require("../src/infrastructure/database/migrations/migrationRunner");
dotenv_1.default.config({ path: path_1.default.join(__dirname, "..", ".env") });
async function forceMigrate() {
    const pool = new pg_1.Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    try {
        console.log("Force running migrations...");
        // First, release ALL advisory locks
        console.log("Releasing all advisory locks...");
        await pool.query("SELECT pg_advisory_unlock_all()");
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 500));
        // Now run migrations
        await (0, migrationRunner_1.runMigrations)(pool);
        console.log("\n✓ Migration complete!");
    }
    catch (error) {
        console.error("Migration failed:", error.message);
        throw error;
    }
    finally {
        await pool.end();
    }
}
forceMigrate().catch(console.error);
