import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [logs, setLogs] = useState([]);
  const [userShelves, setUserShelves] = useState([]);
  const [myEntries, setMyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');

  const [buddyRead, setBuddyRead] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const primaryNames = ['to-read', 'reading', 'finished'];

  useEffect(() => {
    // Reset book-specific states on ID change
    setLoading(true);
    setBuddyRead(null);
    setMyEntries([]);
    setUserReview(null);
    fetchDetails();
  }, [bookId]);

  const fetchDetails = async () => {
    try {
      const bookRes = await api.get(`/books/${bookId}`);
      setBook(bookRes.data.book || bookRes.data);

      const [shelfRes, entriesRes, reviewsRes, myReviewRes, logRes] = await Promise.allSettled([
        api.get('/shelf'),
        api.get('/shelf/my-entries'),
        api.get(`/logs/reviews/${bookId}`),
        api.get(`/logs/my-review/${bookId}`),
        api.get(`/logs?bookID=${bookId}`)
      ]);

      if (shelfRes.status === 'fulfilled') setUserShelves(shelfRes.value.data.shelves || []);
      if (logRes.status === 'fulfilled') setLogs(logRes.value.data.logs || []);
      if (reviewsRes.status === 'fulfilled') setAllReviews(reviewsRes.value.data.reviews || []);

      let entryIdToCheck = null;

      if (entriesRes.status === 'fulfilled') {
        const entries = entriesRes.value.data.entries || [];
        const filtered = entries.filter(e => (e.bookId?._id || e.bookId) === bookId);
        setMyEntries(filtered);

        const primary = filtered.find(e => primaryNames.includes(e.shelfId?.name?.toLowerCase()));
        if (primary) {
          entryIdToCheck = primary._id;
        }
      }

      if (myReviewRes.status === 'fulfilled' && myReviewRes.value.data.review) {
        setUserReview(myReviewRes.value.data.review);
      }

      if (entryIdToCheck) {
        try {
          const buddyRes = await api.get(`/buddyRead/check/${entryIdToCheck}`);
          setBuddyRead(buddyRes.data.buddyRead || null);
        } catch (e) {
          console.error("BuddyRead check request failed", e);
        }
      }

    } catch (err) {
      console.error("Critical fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuddyRead = async () => {
    try {
      const currentPrimary = myEntries.find(e => primaryNames.includes(e.shelfId?.name?.toLowerCase()));
      if (!currentPrimary) return alert("Add to shelf first!");

      const response = await api.post('/buddyRead/create', {
        bookInShelf: currentPrimary._id,
        startDate: new Date()
      });

      if (response.data.success) {
        setBuddyRead(response.data.buddyRead);
        alert("BuddyRead created!");
        await fetchDetails();
      }
    } catch (err) {
      console.error("Creation error", err);
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
  };

  const handleSubmitReview = async () => {
    try {
      await api.post('/logs/createReview', { bookID: bookId, rating, text: reviewText });
      setShowReviewModal(false);
      await fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!book) return null;

  const currentPrimaryEntry = myEntries.find(e => primaryNames.includes(e.shelfId?.name?.toLowerCase()));
  const statusName = currentPrimaryEntry?.shelfId?.name?.toLowerCase();
  const progressPercent = (book.length > 0 && currentPrimaryEntry?.progress)
    ? Math.round((currentPrimaryEntry.progress / book.length) * 100) : 0;

  return (
    <div className="book-detail-container">
      <button
        className="back-link"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
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
              <button className="btn-add-to-shelf" onClick={() => handlePrimaryChange(userShelves.find(s => s.name.toLowerCase() === 'to-read')?._id)}>
                Add to my to-read shelf
              </button>
            ) : (
              <div className="active-status-box">
                <select className="primary-select" value={currentPrimaryEntry.shelfId?._id || currentPrimaryEntry.shelfId} onChange={(e) => handlePrimaryChange(e.target.value)}>
                  {primaryNames.map(name => {
                    const s = userShelves.find(sh => sh.name.toLowerCase() === name);
                    return s && <option key={s._id} value={s._id}>{s.name}</option>;
                  })}
                  <option value="REMOVE_ACTION">Remove book</option>
                </select>
                {statusName === 'reading' && (
                  <div className="progress-bar-container">
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div></div>
                    <span className="progress-text">{progressPercent}% completed</span>
                  </div>
                )}
                {statusName === 'finished' && (
                  <div className="rating-area">
                    {userReview ? (
                      <div className="rating-display"><span className="stars">{'★'.repeat(userReview.rating)}{'☆'.repeat(5 - userReview.rating)}</span></div>
                    ) : (
                      <button className="btn-create-review" onClick={() => setShowReviewModal(true)}>+ Create review</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="buddy-read-banner">
        <div className="buddy-info">
          <h3>Buddy Read</h3>
          <p>{buddyRead ? "You are reading this with friends!" : "Want to read this with someone else?"}</p>
        </div>
        {buddyRead ? (
          <button className="btn-buddy" onClick={() => navigate(`//buddy-read/${buddyRead._id}`)}>Go to buddyRead</button>
        ) : (
          <button className="btn-buddy outline" onClick={handleCreateBuddyRead} >Create a buddyRead</button>
        )}
      </div>

      <hr className="section-divider" />

      <div className="tabs-container">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>My Logs</button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>User Reviews</button>
        </div>
        <div className="tab-content">
          {activeTab === 'logs' ? (
            <div className="logs-list">
              {logs.map(log => <div key={log._id} className="log-item"><span className="log-date">{new Date(log.createdAt).toLocaleDateString()}</span><p>{log.note || `Progress: ${log.progress} pages`}</p></div>)}
            </div>
          ) : (
            <div className="reviews-list">
              {allReviews.map(rev => (
                <div key={rev._id} className="review-card">
                  <div className="review-user-info">
                    <strong>{rev.userID?.name || 'Anonymous'}</strong>
                    <span className="stars">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </span>
                  </div>
                  <p className="review-body">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReviewModal && (
        <div className="modal-overlay">
          <div className="review-modal">
            <h2>Review {book.name}</h2>
            <div className="rating-input">{[1, 2, 3, 4, 5].map(n => <span key={n} className={rating >= n ? 'star filled' : 'star'} onClick={() => setRating(n)}>★</span>)}</div>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
            <div className="modal-actions">
              <button onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button onClick={handleSubmitReview}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;