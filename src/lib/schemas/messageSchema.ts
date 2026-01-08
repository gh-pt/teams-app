import { z } from "zod";

export const messageSchema = z.object({
  senderId: z.string(),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(5000, "Content too long"),
  contentType: z
    .enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE"])
    .optional()
    .default("TEXT"),
  fileUrl: z.string().optional().nullable(),
});

export type MessageSchema = z.infer<typeof messageSchema>;
