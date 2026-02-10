import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import './BookDetail.css';

const BookDetail = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const logRes = await api.get(`/logs/book-logs?bookID=${bookId}`);
        setLogs(logRes.data.logs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetails();
  }, [bookId]);

  return (
    <div className="book-detail-container">
      <div className="book-hero">
        <div className="book-meta">
          <h1>{book?.name || "Book Title"}</h1>
          <p className="author">by {book?.author || "Author"}</p>
        </div>
        <div className="progress-section">
        </div>
      </div>

      <section className="feature-section">
        <h3>Buddy Reading</h3>
        <p>Invite friends to read this book with you and share notes!</p>
        <button className="btn-cta">Start Buddy Read Session</button>
      </section>

      <div className="logs-section">
        <h3>Reading Progress</h3>
        {logs.map(log => (
          <div key={log._id} className="log-entry">
            <span>Page {log.currentPage}</span>
            <p>{log.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookDetail;