import * as z from "zod";

export const CreateBook = z.object({
  name: z.string().min(2, "Book name must be at least 2 chars"),
  length: z.int32().positive({message: "Length must be greater than 0"}),
  author: z.string().min(2, "Author name must be at least 2 chars"),
  category: z.int32().positive({message: "Select category"})
});

export const CreateCategory = z.object({
    id: z.int32().positive(),
    name: z.string().min(2, "Category name must be at least 2 chars")
})

export const CreateStatus = z.object({
    id: z.int32().positive(),
    description: z.string().min(2, "Description must be at least 2 chars")
})

export const Shelves = z.object({
    status: z.int32().positive({message: "Select status"}),
    progress: z.int32().positive(),
    bookID: z.string().min(1, "Select Book")
})

export const Reviews = z.object({
    bookID: z.string().min(1, "Select Book"),
    rating: z.int32().positive(),
    text: z.string().min(2, "enter reviews")
})

export const BuddyReadSharing = z.object({
    userIdShared: z.string().min(1, "Select user")
})