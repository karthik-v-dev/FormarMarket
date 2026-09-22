import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const router = Router();

function token(user: { id: number; role: "CUSTOMER"|"ADMIN"|"DRIVER" }) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

const signupHandler = async (req: any, res: any) => {
  const body = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional()
  }).parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return res.status(409).json({ message: "Email already registered" });
  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, passwordHash },
    select: { id: true, name: true, email: true, role: true }
  });
  res.status(201).json({ user, token: token(user) });
};

router.post("/signup", signupHandler);
router.post("/register", signupHandler);

router.post("/login", async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password" });
  const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ user: safe, token: token(user) });
});

export default router;