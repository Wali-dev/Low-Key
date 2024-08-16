import { z } from "zod";

export const messageSchema = z.object({
    content: z.string().min(10, { message: "content must be 10 char" }).max(300, { message: "content can not be more than 300 char" }),
    createdAt: z.date()
})