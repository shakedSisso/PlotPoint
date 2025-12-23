import * as z from "zod";

export const CreateBook = z.object({
  name: z.string().min(2, "Book name must be at least 2 chars"),
  length: z.int().positive({message: "Length must be greater than 0"}),
  author: z.string().min(2, "Author name must be at least 2 chars"),
  category: z.string().min(1, "Select a category"),
});