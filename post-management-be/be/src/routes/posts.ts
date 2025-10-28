import { Hono, Context } from "hono";
import pool from "../db/connection.js";
import { authMiddleware } from "../middleware/auth.js";

const postsRouter = new Hono();

postsRouter.get("/", async (c: Context) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search") || "";

    if (page < 1 || limit < 1) {
      return c.json({ error: "page and limit must be greater than 0" }, 400);
    }

    const offset = (page - 1) * limit;

    // --- Build dynamic query parts ---
    const params: any[] = [];
    let whereClause = "";

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE p.title ILIKE $${params.length}`;
    }

    // --- Count query ---
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM posts p
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // --- Posts query ---
    // Add limit and offset *after* existing params
    params.push(limit);
    params.push(offset);

    const postsQuery = `
      SELECT p.id, p.title, p.text_description, p.thumbnail, p.created_at, p.created_by,
             u.first_name, u.last_name, u.email
      FROM posts p
      JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const result = await pool.query(postsQuery, params);

    // --- Response ---
    return c.json(
      {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      200
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get post by ID
postsRouter.get("/:id", async (c: Context) => {
  try {
    const postId = parseInt(c.req.param("id"));

    const result = await pool.query(
      `SELECT p.id, p.title, p.text_description, p.thumbnail, p.created_at, p.created_by,
              u.first_name, u.last_name, u.email
       FROM posts p
       JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [postId]
    );

    if (result.rows.length === 0) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json(result.rows[0], 200);
  } catch (error) {
    console.error("Error fetching post:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create post with thumbnail (protected)
postsRouter.post("/", authMiddleware, async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const title = formData.get("title") as string;
    const text_description = formData.get("description") as string;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const user = c.get("user");

    if (!title || !text_description) {
      return c.json({ error: "title and description are required" }, 400);
    }

    // Handle thumbnail upload
    let thumbnailPath = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const allowedMimes = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimes.includes(thumbnailFile.type)) {
        return c.json(
          { error: "Only image files are allowed (jpeg, png, gif, webp)" },
          400
        );
      }

      if (thumbnailFile.size > 5 * 1024 * 1024) {
        return c.json({ error: "File size must be less than 5MB" }, 400);
      }

      const buffer = await thumbnailFile.arrayBuffer();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
        thumbnailFile.name
      }`;
      const filepath = `./uploads/${filename}`;

      // Save file
      const fs = await import("fs/promises");
      await fs.mkdir("./uploads", { recursive: true });
      await fs.writeFile(filepath, Buffer.from(buffer));

      thumbnailPath = `/uploads/${filename}`;
    }

    const result = await pool.query(
      `INSERT INTO posts (title, text_description, thumbnail, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, text_description, thumbnail, created_at, created_by`,
      [title, text_description, thumbnailPath, user.id]
    );

    return c.json(result.rows[0], 201);
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update post with thumbnail (protected)
postsRouter.put("/:id", authMiddleware, async (c: Context) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const user = c.get("user");

    // Check if post exists and user is the owner
    const postResult = await pool.query(
      "SELECT created_by FROM posts WHERE id = $1",
      [postId]
    );

    if (postResult.rows.length === 0) {
      return c.json({ error: "Post not found" }, 404);
    }

    if (postResult.rows[0].created_by !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const formData = await c.req.formData();
    const title = formData.get("title") as string;
    const text_description = formData.get("text_description") as string;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    // Handle thumbnail upload
    let thumbnailPath = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimes.includes(thumbnailFile.type)) {
        return c.json(
          { error: "Only image files are allowed (jpeg, png, gif, webp)" },
          400
        );
      }

      if (thumbnailFile.size > 5 * 1024 * 1024) {
        return c.json({ error: "File size must be less than 5MB" }, 400);
      }

      const buffer = await thumbnailFile.arrayBuffer();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
        thumbnailFile.name
      }`;
      const filepath = `./uploads/${filename}`;

      // Save file
      const fs = await import("fs/promises");
      await fs.mkdir("./uploads", { recursive: true });
      await fs.writeFile(filepath, Buffer.from(buffer));

      thumbnailPath = `/uploads/${filename}`;
    }

    const result = await pool.query(
      `UPDATE posts
       SET title = COALESCE($1, title),
           text_description = COALESCE($2, text_description),
           thumbnail = COALESCE($3, thumbnail),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, title, text_description, thumbnail, created_at, created_by, updated_at`,
      [title || null, text_description || null, thumbnailPath || null, postId]
    );

    return c.json(result.rows[0], 200);
  } catch (error) {
    console.error("Error updating post:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete post (protected)
postsRouter.delete("/:id", authMiddleware, async (c: Context) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const user = c.get("user");

    // Check if post exists and user is the owner
    const postResult = await pool.query(
      "SELECT created_by FROM posts WHERE id = $1",
      [postId]
    );

    if (postResult.rows.length === 0) {
      return c.json({ error: "Post not found" }, 404);
    }

    if (postResult.rows[0].created_by !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);

    return c.json({ message: "Post deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting post:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default postsRouter;
