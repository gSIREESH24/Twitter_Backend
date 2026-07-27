import { z } from "zod";

export const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  bio: z
    .string()
    .max(160)
    .optional(),

  profileImage: z
    .string()
    .url()
    .optional(),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;