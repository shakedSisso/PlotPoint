import * as z from "zod";

export const RegisterUser = z.object({
  name: z.string().min(2, "Name must be at least 2 chars"),
  username: z.string().min(2, "Username must be at least 2 chars"),
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be at least 8 chars")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain special character") 
    // `^` inside `[]` excludes the characters: a-z, A-Z, 0-9
});

export const LoginUser = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required")
});