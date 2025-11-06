
import { z } from "zod";
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  role: z.enum(["consumer", "partner", "admin"]).optional()
});
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
