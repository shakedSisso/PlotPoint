import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [logs, setLogs] = useState([]);
  const [shelfEntry, setShelfEntry] = useState(null); // To track progress and shelf status

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Fetch book metadata
        const bookRes = await api.get(`/books/${bookId}`);
        setBook(bookRes.data.book);

        // 2. Fetch reading logs
        const logRes = await api.get(`/logs/book-logs?bookID=${bookId}`);
        setLogs(logRes.data.logs);

        // 3. Fetch specific shelf info for this book (to get shelf name and progress)
        // We assume your backend has a route to get a single BookInShelf entry
        const shelfRes = await api.get(`/shelf/book-status/${bookId}`);
        setShelfEntry(shelfRes.data.entry);

      } catch (err) {
        console.error("Error fetching book details:", err);
      }
    };
    fetchDetails();
  }, [bookId]);

  if (!book) return <div className="loading">Loading book details...</div>;

  // Calculate progress percentage
  const progressPercentage = (book.length && shelfEntry)
    ? Math.min(Math.round((shelfEntry.progress / book.length) * 100), 100)
    : 0;

  // Check if book is in a 'reading' shelf
  const isReading = shelfEntry?.shelfId?.name?.toLowerCase().includes('reading');

  return (
    <div className="book-detail-container">
      {/* Back Button */}
      <Link to="/profile" className="back-link">← Back</Link>

      {/* Book Title at the top */}
      <header className="book-detail-header">
        <h1>{book.name}</h1>
        <div className="header-divider"></div>
      </header>

      <div className="book-upper-layout">
        {/* Left Side: Large Book Cover */}
        <div className="book-cover-large">
          {book.name ? book.name.charAt(0).toUpperCase() : '?'}
        </div>

        {/* Right Side: Metadata */}
        <div className="book-metadata-side">
          <div className="meta-group">
            <label>Author</label>
            <p>{book.author}</p>
          </div>
          <div className="meta-group">
            <label>Category</label>
            <p>{book.category?.name || "Uncategorized"}</p>
          </div>
          <div className="meta-group">
            <label>Total Pages</label>
            <p>{book.length} pages</p>
          </div>
        </div>
      </div>

      {/* Centered Progress Section - Only if in 'Reading' shelf */}
      <div className="middle-interaction-area">
        {isReading && (
          <div className="progress-section-card">
            <h3>Current Reading Progress</h3>
            <div className="detail-progress-bar-bg">
              <div 
                className="detail-progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <span className="progress-label">{progressPercentage}%</span>
            </div>
            <p className="page-count">{shelfEntry.progress} of {book.length} pages read</p>
          </div>
        )}

        {/* Buddy Reading Section - Placed under progress or top section */}
        <section className="buddy-feature-card">
          <div className="buddy-content">
            <h3>Buddy Reading</h3>
            <p>Invite friends to read <strong>{book.name}</strong> with you and share notes in real-time!</p>
          </div>
          <button className="btn-buddy-cta">Start Session</button>
        </section>
      </div>

      {/* Logs Section */}
      <div className="logs-container">
        <h3>My Reading Notes</h3>
        {logs.length > 0 ? logs.map(log => (
          <div key={log._id} className="log-entry-item">
            <div className="log-header">
              <span className="log-page">Page {log.currentPage}</span>
              <span className="log-date">{new Date(log.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="log-note">{log.note}</p>
          </div>
        )) : <p className="empty-text">No notes yet. Keep reading to add logs!</p>}
      </div>
    </div>
  );
};

export default BookDetail;