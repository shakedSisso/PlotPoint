import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './ShelfView.css';

const ShelfView = () => {
  const { shelfName } = useParams();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get(`/shelf/${shelfName}/books`);
        setBooks(res.data.books);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, [shelfName]);

  // Helper for read-only star display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${rating && i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return (
      <div className="star-rating">
        <div className="stars-wrapper">{stars}</div>
        {!rating && <span className="rate-text">Rate</span>}
      </div>
    );
  };

  return (
    <div className="shelf-view-container">
      {/* Navigation: Back Button */}
      <div className="shelf-actions">
        <Link to="/profile" className="btn-back">
          ← Back to Profile
        </Link>
      </div>

      <div className="shelf-header">
        <h1>{shelfName}</h1>
        <div className="divider"></div>
      </div>

      {/* Grid container for book cards */}
      <div className="book-grid">
        {books.length > 0 ? books.map(entry => {
          const book = entry.bookId;
          const categoryName = book.category?.name || "Uncategorized";

          // Calculating visual progress based on backend data
          const progressPercentage = book.length
            ? Math.min(Math.round((entry.progress / book.length) * 100), 100)
            : 0;

          const currentShelf = shelfName.toLowerCase();

          return (
            <Link to={`/book/${book._id}`} key={entry._id} className="book-card-vertical">
              
              {/* Cover Placeholder */}
              <div className="book-cover-placeholder">
                {book.name ? book.name.charAt(0).toUpperCase() : '?'}
              </div>

              {/* Card Body */}
              <div className="book-card-content">
                <div className="book-info">
                  <h3>{book.name}</h3>
                  <p className="book-meta">{book.author} • {categoryName}</p>
                </div>

                <div className="book-status-ui">
                  {/* PROGRESS BAR: Displayed only in READING shelves */}
                  {currentShelf.includes('reading') && (
                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        {/* Bar fill */}
                        <div
                          className="progress-fill"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                        {/* Centered percentage text */}
                        <div className="progress-text-overlay">
                          {progressPercentage}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STARS: Displayed only in FINISHED shelves */}
                  {currentShelf.includes('finished') && (
                    <div className="rating-container">
                      {renderStars(entry.rating)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        }) : (
          <p className="empty-message">No books in this shelf yet.</p>
        )}
      </div>
    </div>
  );
};

export default ShelfView;