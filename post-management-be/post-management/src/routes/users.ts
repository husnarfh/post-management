import { Hono, Context } from "hono";
import pool from "../db/connection.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.js";
// import { uploadProfilePhoto } from "../middleware/upload.js";
import { promisify } from "util";

const usersRouter = new Hono();

// Promisify multer middleware
// const uploadProfilePhotoAsync = promisify(uploadProfilePhoto);

// Helper function to handle multer with Hono
// const handleFileUpload = (upload: any) => {
//   return async (c: Context, next: any) => {
//     const req = c.env.incoming as any;

//     return new Promise((resolve) => {
//       upload(req, {}, (err: any) => {
//         if (err) {
//           c.req._file = null;
//         } else {
//           c.req._file = (req as any).file;
//         }
//         resolve(null);
//       });
//     }).then(() => next());
//   };
// };

// Create User with profile photo
usersRouter.post("/", async (c: Context) => {
  try {
    const body = await c.req.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      profile_photo,
      profile_photo_name,
      profile_photo_type,
    } = body;

    // Validation
    if (!firstName || !email || !password) {
      return c.json(
        { error: "firstName, email, and password are required" },
        400
      );
    }

    // Check if email exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return c.json({ error: "Email already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    // Handle Base64 image
    let profilePhotoPath = null;
    if (profile_photo) {
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimes.includes(profile_photo_type)) {
        return c.json({ error: "Only image files are allowed" }, 400);
      }

      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64Data = profile_photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Check size (5MB limit)
      if (buffer.length > 5 * 1024 * 1024) {
        return c.json({ error: "File size must be less than 5MB" }, 400);
      }

      const filename = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}-${profile_photo_name}`;
      const filepath = `./uploads/${filename}`;

      const fs = await import("fs/promises");
      await fs.mkdir("./uploads", { recursive: true });
      await fs.writeFile(filepath, buffer);

      profilePhotoPath = `/uploads/${filename}`;
    }

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone_number, profile_photo, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, email, phone_number, profile_photo, created_at`,
      [
        firstName,
        lastName || null,
        email,
        hashedPassword,
        phone || null,
        profilePhotoPath,
        null,
      ]
    );

    return c.json(result.rows[0], 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Login
usersRouter.post("/login", async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "email and password are required" }, 400);
    }

    const result = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = generateToken({ id: user.id, email: user.email });
    return c.json({ token, userId: user.id }, 200);
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update User with profile photo (protected)
usersRouter.put("/:id", authMiddleware, async (c: Context) => {
  try {
    const userId = parseInt(c.req.param("id"));
    const user = c.get("user");

    // Check authorization
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const formData = await c.req.formData();
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const phone_number = formData.get("phone_number") as string;
    const profilePhotoFile = formData.get("profile_photo") as File | null;

    // Handle profile photo upload
    let profilePhotoPath = null;
    if (profilePhotoFile && profilePhotoFile.size > 0) {
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimes.includes(profilePhotoFile.type)) {
        return c.json(
          { error: "Only image files are allowed (jpeg, png, gif, webp)" },
          400
        );
      }

      if (profilePhotoFile.size > 5 * 1024 * 1024) {
        return c.json({ error: "File size must be less than 5MB" }, 400);
      }

      const buffer = await profilePhotoFile.arrayBuffer();
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
        profilePhotoFile.name
      }`;
      const filepath = `./uploads/${filename}`;

      // Save file
      const fs = await import("fs/promises");
      await fs.mkdir("./uploads", { recursive: true });
      await fs.writeFile(filepath, Buffer.from(buffer));

      profilePhotoPath = `/uploads/${filename}`;
    }

    const result = await pool.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone_number = COALESCE($3, phone_number),
           profile_photo = COALESCE($4, profile_photo)
       WHERE id = $5
       RETURNING id, first_name, last_name, email, phone_number, profile_photo, created_at`,
      [
        first_name || null,
        last_name || null,
        phone_number || null,
        profilePhotoPath || null,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(result.rows[0], 200);
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get User by ID
usersRouter.get("/:id", async (c: Context) => {
  try {
    const userId = parseInt(c.req.param("id"));

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone_number, profile_photo, created_at FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(result.rows[0], 200);
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default usersRouter;
