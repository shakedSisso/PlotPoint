import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ShelfView from './pages/ShelfView';
import BookDetail from './pages/BookDetail';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="main-nav">
          <Link to="/" className="logo">PlotPoint</Link>
          <div className="nav-links">
            {user ? (
              <>
                <button className="logout-btn" onClick={() => {
                  localStorage.removeItem('user');
                  setUser(null);
                  window.location.href = '/login';
                }}>Logout</button>
                <Link to="/profile">Profile</Link>
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
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser}/>} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            <Route path="/shelf/:shelfName" element={user ? <ShelfView user={user} /> : <Navigate to="/login" />} />
            <Route path="/book/:bookId" element={user ? <BookDetail user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <footer className="main-footer">
          <p>© 2026 PlotPoint. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="home-hero">
    <h1>Your Library, <span style={{color:'var(--terracotta)'}}>Digitized.</span></h1>
    <p>Organize shelves, track progress, and read together.</p>
  </div>
);

export default App;