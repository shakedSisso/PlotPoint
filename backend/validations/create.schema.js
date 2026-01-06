import * as z from "zod";

export const CreateBook = z.object({
    name: z.string().min(2, "Book name must be at least 2 chars"),
    length: z.coerce.number().positive({ message: "Length must be greater than 0" }),
    author: z.string().min(2, "Author name must be at least 2 chars"),
    categoryName: z.string().min(2, "Category name must be at least 2 chars"),
    isUserAdded: z.boolean().default(false),
    isPrivate: z.boolean().default(false)
});

export const CreateCategory = z.object({
    name: z.string().min(2, "Category name must be at least 2 chars")
})

export const CreateStatus = z.object({
    id: z.number().int().positive("Length must be greater than 0"),
    description: z.string().min(2, "Description must be at least 2 chars")
})

export const CreateShelves = z.object({
    name:z.string().min(1,"Shelf name is required"),
    status: z.string().min(1, "Select status"),
    userID: z.string().min(1, "Select User"),
    isPrivate:z.boolean().default(false)
})

export const CreateReviews = z.object({
    userID: z.string().min(1),
    bookID: z.string().min(1, "Select Book"),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(2, "Enter reviews")
})

export const CreateBuddyReadSharing = z.object({
    BuddyReadId: z.string().min(1, "Select buddy read"),
    userIdShared: z.string().min(1, "Select user")
})

export const CreateBuddyRead = z.object({
    shelfId: z.string().min(1, "Select shelf"),
    StartDate: z.string().or(z.date()),
    EndDate: z.string().or(z.date())
}).refine((data) => new Date(data.EndDate) > new Date(data.StartDate), {
    message: "End date must be after start date",
    path: ["EndDate"],
});

export const CreateLogs = z.object({
    userID: z.string().min(1),
    bookID: z.string().min(1, "Select book"),
    currentPage: z.number().int().nonnegative(),
    note:z.string().min(1, "Enter log")
})

export const CreateBookInShelf = z.object({
  bookID: z.string().min(1, "Select book"),
  shelfID: z.string().min(1, "Select shelf"),
  progress: z.number().int().nonnegative()
});
