import z from "zod";

export const loginSchema = z.object({
  email: z.email().min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/,
      "Password must contain letters, numbers, and special characters"
    ),
});

export type LoginSchema = z.infer<typeof loginSchema>;
