import { z } from "zod/v4";

export const signInInput = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignInInput = z.infer<typeof signInInput>;

export const signUpInput = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name too long"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignUpInput = z.infer<typeof signUpInput>;
