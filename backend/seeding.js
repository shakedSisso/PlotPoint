import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const GENRES = [
    "Fiction", "Fantasy", "Science Fiction", "Mystery", "Horror",
    "History", "Romance", "Biography", "Classic", "Poetry"
];

async function populateBooks() {
    try {
        const uri = process.env.DATABASE_URL;
        if (!uri) {
            throw new Error("DATABASE_URL is not defined in environment variables");
        }

        await mongoose.connect(uri);
        const db = mongoose.connection;
        
        const booksCollection = db.collection('books');
        const categoriesCollection = db.collection('categories');
        const statusCollection = db.collection('statuses');

        let statusDoc = await statusCollection.findOne({ description: "User Created" });
        if (!statusDoc) {
            const result = await statusCollection.insertOne({ description: "User Created" });
            statusDoc = { _id: result.insertedId };
        }

        console.log("Fetching books with covers from Open Library...");
        const booksToInsert = [];
        const seenTitles = new Set();

        for (const genre of GENRES) {
            if (booksToInsert.length >= 50) break;

            const url = `https://openlibrary.org/subjects/${genre.toLowerCase().replace(' ', '_')}.json?limit=15`;
            const response = await axios.get(url);
            const works = response.data.works || [];

            for (const work of works) {
                if (booksToInsert.length >= 50) break;
                if (seenTitles.has(work.title)) continue;

                let categoryDoc = await categoriesCollection.findOne({ name: genre });
                if (!categoryDoc) {
                    const catResult = await categoriesCollection.insertOne({ name: genre });
                    categoryDoc = { _id: catResult.insertedId };
                }

                // Constructing the cover URL using Open Library's cover API
                // We use the Large ('-L') version for better quality in the UI
                const coverUrl = work.cover_id 
                    ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` 
                    : null;

                booksToInsert.push({
                    name: work.title,
                    author: work.authors?.[0]?.name || "Unknown Author",
                    length: work.edition_count * 200 || 300,
                    category: categoryDoc._id,
                    coverImage: coverUrl,
                    isUserAdded: false,
                    isPrivate: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                seenTitles.add(work.title);
            }
        }

        if (booksToInsert.length > 0) {
            const result = await booksCollection.insertMany(booksToInsert);
            console.log(`Successfully added ${result.insertedCount} books with covers to the database.`);
        }

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.connection.close();
    }
}

populateBooks();