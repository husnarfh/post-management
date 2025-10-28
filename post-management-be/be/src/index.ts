import { Hono } from "hono";
import { serve } from "@hono/node-server";
import "dotenv/config";
import { readFile } from "fs/promises";
import { extname } from "path";
import { cors } from "hono/cors";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";

const app = new Hono();
const PORT = parseInt(process.env.PORT || "3001");

app.use(
  "*",
  cors({
    origin: "*", // Allow all origins (development only)
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.path}`);
  await next();
});

// Serve static files (uploads)
app.get("/uploads/:filename", async (c) => {
  try {
    const filename = c.req.param("filename");
    const filepath = `./uploads/${filename}`;

    const data = await readFile(filepath);

    // Set content type based on file extension
    const ext = extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    c.header("Content-Type", contentType);

    return c.body(data);
  } catch (error) {
    return c.json({ error: "File not found" }, 404);
  }
});

// Health check
app.get("/", (c) => {
  return c.json({ message: "Post Management API is running" });
});

// Routes
app.route("/api/users", usersRouter);
app.route("/api/posts", postsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Route not found" }, 404);
});

// Start the server
serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`🚀 Server is running on http://localhost:${PORT}`);
