import { z } from "zod";

export const createTweetSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Tweet cannot be empty")
    .max(280, "Tweet cannot exceed 280 characters"),
});

export type CreateTweetDto = z.infer<typeof createTweetSchema>;

export const updateTweetSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(280),
});

export type UpdateTweetDto =
    z.infer<typeof updateTweetSchema>;