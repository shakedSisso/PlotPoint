import mongoose from "mongoose";

export function connectDB() {
    mongoose.connect(process.env.DATABASE_URL);
    const database = mongoose.connection;

    database.on('error', (error)=> {
        console.log('Database connection error: ', error);
    });

    database.once('open', () => {
        console.log('Connected to the database');
    });
}