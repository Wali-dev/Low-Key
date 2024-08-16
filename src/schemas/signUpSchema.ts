import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(2, "username must be atleast 2 char")
    .max(20, "username must not be more than 20 char")
    .regex(/^[a-zA-Z0-9_]+$/, "username must not content any special char")



export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "invalid email address" }),
    password: z.string().min(4, { message: "password must be 4 char" })
})