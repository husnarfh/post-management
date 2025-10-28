import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "31.97.221.50",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "post_management",
  user: process.env.DB_USER || "developer",
  password: process.env.DB_PASSWORD || "developer123",
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export default pool;
