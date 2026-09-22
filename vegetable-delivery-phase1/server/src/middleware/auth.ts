import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number; role: "CUSTOMER" | "ADMIN" | "DRIVER" };
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Authentication required" });

  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as AuthRequest["user"];
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: AuthRequest["user"] extends infer T ? T extends {role: infer R} ? R[] : never : never) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as never)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}