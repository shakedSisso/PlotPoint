import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ShelfView from './pages/ShelfView';
import BookDetail from './pages/BookDetail';
import Explore from './pages/Explore';
import logo from './assets/logo.png';
import api from './utils/api';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="main-nav">
          <Link to="/" className="logo-container">
            <img src={logo} alt="PlotPoint Logo" className="logo-img" />
            <span className="logo-text">PlotPoint</span>
          </Link>
          <div className="nav-links">
            <Link to="/explore" className="nav-item">Explore</Link>
            {user ? (
              <>
                <Link to="/profile">Profile</Link>
                <button className="logout-btn" onClick={() => {
                  localStorage.removeItem('user');
                  setUser(null);
                  window.location.href = '/login';
                }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="btn-cta">Sign Up</Link>
              </>
            )}
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/" element={<Home books={books} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            <Route path="/shelf/:shelfName" element={user ? <ShelfView user={user} /> : <Navigate to="/login" />} />
            <Route path="/book/:bookId" element={user ? <BookDetail user={user} /> : <Navigate to="/login" />} />
            <Route path="/explore" element={<Explore />} />
          </Routes>
        </main>

        <footer className="main-footer">
          <p>© 2026 PlotPoint. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

const Home = ({ books }) => {
  const groupedBooks = books.reduce((acc, book) => {
    const categoryName = book.category?.name || "General";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(book);
    return acc;
  }, {});

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Your Library, <span style={{ color: 'var(--terracotta)' }}>Digitized.</span></h1>
        <p>Organize shelves, track progress, and read together.</p>
      </div>

      <div className="categories-list">
        {Object.keys(groupedBooks).map(category => (
          <div key={category} className="home-category-section">
            <div className="category-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 className="category-label" style={{ margin: 0 }}>{category}</h2>
              <Link
                to={`/explore?category=${encodeURIComponent(category)}`}
                className="see-more-link"
                style={{ color: 'var(--terracotta)', fontWeight: '600', textDecoration: 'none' }}
              >
                See more →
              </Link>
            </div>

            <div className="books-grid">
              {groupedBooks[category].slice(0, 6).map(book => (
                <Link to={`/book/${book._id}`} key={book._id} className="book-card">
                  <div className="book-cover">
                    <img src={book.coverImage} alt={book.name} />
                  </div>
                  <div className="book-info">
                    <h3>{book.name}</h3>
                    <p>{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;