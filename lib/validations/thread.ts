import * as z from "zod";

// we use this UserValidation in the "/components/forms/AccountProfile.tsx"
export const ThreadValidation = z.object({
    thread: z.string().nonempty(),
    accountId: z.string(),
});

export const CommentValidation = z.object({
    thread: z.string().nonempty(),
});