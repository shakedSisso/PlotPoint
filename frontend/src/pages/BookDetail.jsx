import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [logs, setLogs] = useState([]);
  const [userShelves, setUserShelves] = useState([]);
  const [myEntries, setMyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustom, setShowCustom] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [userReview, setUserReview] = useState(null);
  const [usersReview, setUsersReview] = useState(null);

  const primaryNames = ['to-read', 'reading', 'finished'];

  useEffect(() => {
    fetchDetails();
  }, [bookId]);

  const fetchDetails = async () => {
    try {
      const bookRes = await api.get(`/books/${bookId}`);
      setBook(bookRes.data.book || bookRes.data);

      const [shelfListRes, myEntriesRes, reviewsRes, myReviewRe] = await Promise.allSettled([
        api.get('/shelf'),
        api.get('/shelf/my-entries'),
        api.get(`/logs/reviews/${bookId}`),
        api.get(`/logs/my-review/${bookId}`)
      ]);

      if (shelfListRes.status === 'fulfilled') setUserShelves(shelfListRes.value.data.shelves || []);
      if (myEntriesRes.status === 'fulfilled') setMyEntries(myEntriesRes.value.data.entries || []);
      if (reviewsRes.status === 'fulfilled') setUsersReview(reviewsRes.value.data.reviews || []);
      if (myReviewRe.status === 'fulfilled') setUserReview(myReviewRe.value.data.review || null);

      // const logRes = await api.get(`/logs?bookID=${bookId}`);
      // setLogs(logRes.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryChange = async (newShelfId) => {
    if (!newShelfId) return;
    try {
      const currentPrimary = myEntries.find(e => primaryNames.includes(e.shelfId?.name?.toLowerCase()));
      const oldShelfId = currentPrimary?.shelfId?._id || currentPrimary?.shelfId;

      if (newShelfId === "REMOVE_ACTION") {
        if (oldShelfId) await api.delete(`/shelf/${oldShelfId}/books/${bookId}`);
      } else if (currentPrimary) {
        await api.post('/shelf/book/update-shelf', { bookID: bookId, oldShelfID: oldShelfId, newShelfID: newShelfId });
      } else {
        await api.post('/shelf/add', { bookID: bookId, shelfID: newShelfId, progress: 0 });
      }
      await fetchDetails();
    } catch (err) {
      console.error(err);
    }
  }

  const handleSubmitReview = async () => {
    try {
      await api.post('/logs/createReview', {
        bookID: bookId,
        rating: rating,
        text: reviewText
      });
      setShowReviewModal(false);
      await fetchDetails();
    } catch (err) {
      console.error("Failed to save review", err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return null;

  const currentPrimaryEntry = myEntries.find(e => primaryNames.includes(e.shelfId?.name?.toLowerCase()));
  const statusName = currentPrimaryEntry?.shelfId?.name?.toLowerCase();
  const progressPercent = (book.length > 0 && currentPrimaryEntry?.progress)
    ? Math.round((currentPrimaryEntry.progress / book.length) * 100)
    : 0;

  const primaryShelves = userShelves.filter(s => primaryNames.includes(s.name.toLowerCase()));
  const customShelves = userShelves.filter(s => !primaryNames.includes(s.name.toLowerCase()));

  return (
    <div className="book-detail-container">
      <Link to="/" className="back-link">← Back</Link>

      <div className="book-upper-layout">
        <div className="book-cover-wrapper">
          <img src={book.coverImage} alt={book.name} className="book-cover-large" />
        </div>

        <div className="book-metadata-side">
          <header className="book-detail-header">
            <h1>{book.name}</h1>
            <p className="author-text">by {book.author}</p>
            <p className="page-count-small">{book.length} pages</p>
          </header>

          <div className="status-container">
            {!currentPrimaryEntry ? (
              <button
                className="btn-add-to-shelf"
                onClick={() => handlePrimaryChange(primaryShelves.find(s => s.name.toLowerCase() === 'to-read')?._id)}
              >
                Add to my to-read shelf
              </button>
            ) : (
              <div className="active-status-box">
                <select
                  className="primary-select"
                  value={currentPrimaryEntry.shelfId?._id || currentPrimaryEntry.shelfId}
                  onChange={(e) => handlePrimaryChange(e.target.value)}
                >
                  <option value="" disabled>Change Status</option>
                  {primaryShelves.map(shelf => (
                    <option key={shelf._id} value={shelf._id}>{shelf.name}</option>
                  ))}
                  <option value="REMOVE_ACTION" className="remove-option">Remove book</option>
                </select>

                {statusName === 'reading' && (
                  <div className="progress-bar-container">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="progress-text">{progressPercent}% completed</span>
                  </div>
                )}

                {statusName === 'finished' && (
                  <div className="rating-area">
                    {userReview ? (
                      <div className="rating-display">
                        <span className="rating-label">Your Rating:</span>
                        <span className="stars">
                          {'★'.repeat(userReview.rating)}
                          {'☆'.repeat(5 - userReview.rating)}
                        </span>
                      </div>
                    ) : (
                      <button className="btn-create-review" onClick={() => setShowReviewModal(true)}>
                        + Create review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="custom-shelves-container">
            <button className="add-custom-trigger" onClick={() => setShowCustom(!showCustom)}>
              {showCustom ? '− Hide Custom' : '+ Add to Custom Shelf'}
            </button>
            {showCustom && (
              <div className="custom-grid">
                {customShelves.map(shelf => (
                  <label key={shelf._id} className="custom-check">
                    <input
                      type="checkbox"
                      checked={myEntries.some(e => (e.shelfId?._id || e.shelfId) === shelf._id)}
                      onChange={() => { }}
                    />
                    <span>{shelf.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="modal-overlay">
          <div className="review-modal">
            <h2>Review {book.name}</h2>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(num => (
                <span
                  key={num}
                  className={`star-input ${rating >= num ? 'filled' : ''}`}
                  onClick={() => setRating(num)}
                >★</span>
              ))}
            </div>
            <textarea
              placeholder="Write your thoughts here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="btn-cta" onClick={handleSubmitReview}>Save Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;