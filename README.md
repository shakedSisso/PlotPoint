# PlotPoint 📚

PlotPoint is a full-stack web application designed to help users discover, organize, and manage their personal book library in a simple and visually clean way.  
The system allows users to add books manually or import them using an ISBN number, automatically fetching book data such as title, author, category, cover image, and page count from external book APIs.

This project demonstrates a complete modern web architecture using React on the frontend and Node.js with Express and MongoDB on the backend.

---

# ✨ Overview

PlotPoint provides a digital environment where users can:

- Build a personal library
- Organize books by categories
- Import books by ISBN using public APIs
- View book details including cover and metadata
- Navigate through a clean, responsive interface

The goal of the system is to simplify book tracking while showcasing real-world full-stack development practices.

---

# ⚙️ How the System Works

## Frontend
The frontend is built with **React + Vite** and is responsible for:

- Rendering the user interface
- Handling user interactions
- Fetching data from the backend API
- Displaying book cards, modals, and navigation

When a user enters an ISBN:

1. The frontend calls external APIs (OpenLibrary / Google Books).
2. Metadata is extracted and previewed in a modal.
3. After confirmation, the data is sent to the backend.

---

## Backend
The backend is built with **Node.js + Express** and handles:

- REST API endpoints
- Database communication with MongoDB (Mongoose)
- Category management
- Book creation and validation
- Duplicate prevention
- Data normalization (pages, cover images, etc.)

The backend ensures:

- Each book has normalized metadata
- Categories are created automatically if missing
- Stable cover image URLs are stored

---

## Database
MongoDB stores:

- Books
- Categories
- User-related metadata

Each book document includes:

- name
- author
- coverImage
- length (pages)
- category reference
- isUserAdded flag
- isbn

---

# 🧱 Tech Stack

## Frontend
- React
- Vite
- React Router
- CSS Modules / Global CSS Variables

## Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication Middleware

## External APIs
- OpenLibrary API
- Google Books API

---

# 🚀 Installation & Setup

## 1️⃣ Clone the Project

```bash
git clone https://github.com/shakedsisso/plotpoint.git
cd plotpoint
2️⃣ Backend Setup
cd backend
npm install

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

Run backend server:

npm run dev

Backend runs on:

http://localhost:5000
3️⃣ Frontend Setup
cd ../frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
🔌 API Flow Example (Add Book by ISBN)

User enters ISBN in modal

Frontend fetches metadata from APIs

User confirms book

POST request sent to:

POST /books/add-by-isbn

Backend then:

Checks duplicates

Creates category if needed

Normalizes cover image

Saves book to MongoDB

📂 Project Structure
plotpoint/
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   └── utils/api.js
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
🎨 Design Philosophy

The UI uses a warm, minimal color palette defined in global CSS variables:

Terracotta

Coffee

Cream

Buttercream

Sand

The modal and book cards follow a clean card-based layout designed for readability and smooth interaction.

🔐 Authentication

Protected routes use JWT verification middleware.
Only authenticated users can create or modify books.

📈 Future Improvements

Advanced search and filtering

Reading status tracking

Wishlist / favorites

Social sharing features

Enhanced book recommendations

Pagination & performance optimization

👩‍💻 Development Notes

This project focuses on:

Clean separation between frontend and backend

Defensive API handling

Data normalization

Real API integration

Scalable structure suitable for larger systems

🏁 Running the Full System

Start MongoDB

Run backend server

Run frontend client

Open browser at:

http://localhost:5173

You can now add books, import by ISBN, and manage your library.
