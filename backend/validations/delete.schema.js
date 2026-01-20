import * as z from "zod";

export const DeleteUser = z.object({
  userId: z.string().min(1, "User id is required")
});

export const DeleteShelf = z.object({
  shelfId: z.string().min(1, "Shelf id is required")
});

export const DeleteBook = z.object({
  bookId: z.string().min(1, "Book id is required")
});
