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

  // Helper function to render stars (read-only view)
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
      <div className="shelf-header">
        <h1>{shelfName}</h1>
        <div className="divider"></div>
      </div>

      <div className="book-list">
        {books.length > 0 ? books.map(entry => {
          const book = entry.bookId;
          const categoryName = book.category?.name || "Uncategorized";

          // Calculate reading percentage based on progress divided by total book length
          const progressPercentage = book.length
            ? Math.min(Math.round((entry.progress / book.length) * 100), 100)
            : 0;

          // Normalize the shelf name to lowercase for easy comparison
          const currentShelf = shelfName.toLowerCase();

          return (
            <Link to={`/book/${book._id}`} key={entry._id} className="book-card-horizontal">
              <div className="book-info">
                <h3>{book.name}</h3>
                <p className="book-meta">
                  {book.author} • {categoryName}
                </p>
              </div>

              <div className="book-status-ui">

                {/* Show Progress Bar only in READING shelf */}
                {currentShelf.includes('reading') && (
                  <div className="progress-container">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{progressPercentage}%</span>
                  </div>
                )}

                {/* Show Stars only in FINISHED shelf */}
                {currentShelf.includes('finished') && (
                  <div className="rating-container">
                    {renderStars(entry.rating)}
                  </div>
                )}

              </div>
            </Link>
          )
        }) : (
          <p className="empty-message">No books in this shelf yet.</p>
        )}
      </div>
    </div>
  );
};

export default ShelfView;