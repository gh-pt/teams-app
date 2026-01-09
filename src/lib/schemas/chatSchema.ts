import { z } from "zod";

export const chatSchema = z.object({
  participants: z.array(z.string()),
  message: z.string().optional(),
  groupName: z.string().optional(),
  groupAvatar: z.string().optional(),
});

export type ChatSchema = z.infer<typeof chatSchema>;
