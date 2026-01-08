import z from "zod";

export const signupSchema = z
  .object({
    userName: z
      .string()
      .min(1, "Name is required")
      .max(25, "Name must be at most 25 characters long"),
    email: z.email().min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Must be at least 6 characters long")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/,
        "Password must contain letters, numbers, and special characters"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignupSchema = z.infer<typeof signupSchema>;
