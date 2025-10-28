import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || "7d";

export const generateToken = (payload: { id: number; email: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as SignOptions);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch (error) {
    return null;
  }
};
