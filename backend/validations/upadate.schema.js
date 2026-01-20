import * as z from "zod";

export const DeleteUser = z.object({
  userId: z.string().min(1, "User id is required")
});

