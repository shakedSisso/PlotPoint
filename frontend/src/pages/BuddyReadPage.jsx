import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const BuddyReadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const res = await api.get('/buddyRead');
      if (res.data.success) {
        const found = res.data.buddyReads.find(s => s._id === id);
        if (found) {
          setSession(found);
        } else {
          setError("Session not found");
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load session");
      setLoading(false);
    }
  };

  const handleEndBuddyRead = async () => {
    try {
      // שימוש ב-Route הקיים שלך ב-Backend
      const res = await api.put(`/buddyRead/${id}/end`);
      if (res.data.success) {
        // עדכון ה-State המקומי עם המידע שחזר מהשרת
        setSession(res.data.buddyRead);
      }
    } catch (err) {
      console.error("Error ending buddy read:", err);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p>{error}</p></div>;
  if (!session) return null;

  const bookName = session.bookInShelf?.bookId?.name || "Unknown Book";
  const startDate = new Date(session.startDate).toLocaleDateString();
  const endDate = session.endDate ? new Date(session.endDate).toLocaleDateString() : null;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <button className="btn-secondary" onClick={() => navigate('/profile')} style={{ marginBottom: '2rem' }}>
        ← Back to Profile
      </button>

      <div className="shelf-card buddy-card" style={{ maxWidth: '600px', margin: '0 auto', cursor: 'default', transform: 'none' }}>
        <div className="shelf-card-header">
          <h2 style={{ margin: 0 }}>{bookName}</h2>
          <span className="shelf-badge" style={{ background: 'var(--terracotta)', color: 'white' }}>
            Buddy Read
          </span>
        </div>

        <div className="buddy-dates-container" style={{ padding: '1.5rem', margin: '1.5rem 0' }}>
          <div className="buddy-date-row">
            <span className="buddy-date-label">Started:</span>
            <span className="buddy-date-value">{startDate}</span>
          </div>
          <div className="buddy-date-row">
            <span className="buddy-date-label">Status:</span>
            <span className="buddy-date-value">
              {endDate ? `Finished on ${endDate}` : "Active"}
            </span>
          </div>
        </div>

        {!session.endDate && (
          <button className="btn-cta" onClick={handleEndBuddyRead} style={{ width: '100%', marginTop: '1rem' }}>
            End Buddy Read
          </button>
        )}
      </div>
    </div>
  );
};

export default BuddyReadPage;