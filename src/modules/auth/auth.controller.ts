
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { User } from "../users/user.model";
import { LoginSchema, RegisterSchema } from "./auth.schemas";

export async function register(req: Request, res: Response) {
  const dto = RegisterSchema.parse(req.body);
  const exists = await User.findOne({ email: dto.email });
  if (exists) return res.status(409).json({ message: "Email already in use" });
  const passwordHash = await bcrypt.hash(dto.password, 12);
  const user = await User.create({
    email: dto.email, passwordHash, displayName: dto.displayName, role: dto.role ?? "consumer"
  });
  return res.status(201).json({ id: user.id, email: user.email, displayName: user.displayName, role: user.role });
}

export async function login(req: Request, res: Response) {
  const { email, password } = LoginSchema.parse(req.body);
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
}
