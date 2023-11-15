import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, { message: "Enter username" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
});

export const RegisterSchema = z.object({
  username: z.string().min(1, { message: "Enter username" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
  passwordConfirm: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
});
