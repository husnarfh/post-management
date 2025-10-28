import { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return c.json({ error: "Invalid token" }, 401);
  }

  c.set("user", decoded);
  await next();
};
