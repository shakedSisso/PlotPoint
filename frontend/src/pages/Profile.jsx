import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Profile.css';

const Profile = ({ user }) => {
  const [shelves, setShelves] = useState([]);
  const [buddyReads, setBuddyReads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newShelf, setNewShelf] = useState({ name: '', isPrivate: false });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchShelves(), fetchBuddyReads()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchShelves = async () => {
    try {
      const res = await api.get('/shelf');
      setShelves(res.data.shelves || []);
    } catch (err) {
      console.error("Error fetching shelves:", err);
    }
  };

  const fetchBuddyReads = async () => {
    try {
      const res = await api.get('/buddyRead'); 
      if (res.data.success) {
        setBuddyReads(res.data.buddyReads || []);
      }
    } catch (err) {
      console.error("Error fetching buddy reads:", err);
    }
  };

  const handleCreateShelf = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/shelf/create', newShelf);
      if (res.data.success) {
        setShelves([...shelves, res.data.shelf]);
        setShowModal(false);
        setNewShelf({ name: '', isPrivate: false });
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <div className="container"><p>Loading your library...</p></div>;

  return (
    <div className="profile-page">
      <header className="profile-header-container">
        <div className="user-info">
          <h1>Welcome, {user.name}</h1>
          <p className="username-display">@{user.username}</p>
        </div>
        <button className="btn-cta" onClick={() => setShowModal(true)}>
          + Create New Shelf
        </button>
      </header>

      <section className="profile-section">
        <h2 className="section-title">My Shelves</h2>
        <div className="shelf-grid">
          {shelves.length > 0 ? shelves.map(shelf => (
            <Link to={`/shelf/${shelf.name}`} key={shelf._id} className="shelf-card">
              <div className="shelf-card-header">
                <h3>{shelf.name}</h3>
                <span className="shelf-badge">{shelf.isPrivate ? "Private" : "Public"}</span>
              </div>
              <div className="shelf-preview-container">
                {shelf.previewBooks && shelf.previewBooks.length > 0 ? (
                  shelf.previewBooks.map((book, idx) => (
                    <div key={idx} className="mini-book" title={book?.name}>
                      {book?.name ? book.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  ))
                ) : (
                  <span className="empty-shelf">Empty shelf</span>
                )}
              </div>
            </Link>
          )) : <p>No shelves found.</p>}
        </div>
      </section>

      <section className="profile-section" style={{ marginTop: '3rem' }}>
        <h2 className="section-title">Buddy Reads</h2>
        <div className="shelf-grid">
          {buddyReads.length > 0 ? buddyReads.map(session => {
            const bookName = session.bookInShelf?.bookId?.name || "Unknown Book";
            const startDate = new Date(session.startDate).toLocaleDateString();
            const endDate = session.endDate ? new Date(session.endDate).toLocaleDateString() : "In Progress";

            return (
              <Link to={`/buddy-read/${session._id}`} key={session._id} className="shelf-card buddy-card">
                <div className="shelf-card-header">
                  <h3 style={{ fontSize: '1.1rem' }}>{bookName}</h3>
                  <span className="shelf-badge" style={{ background: '#E2B59A' , color:'#FAF7F2'}}>Buddy Read</span>
                </div>
                
                <div className="buddy-dates-container" style={{ padding: '1rem', fontSize: '0.9rem', color: '#555' }}>
                  <div className="buddy-date-row">
                    <span className="buddy-date-label">Started:</span>
                    <span className="buddy-date-value">{startDate}</span>
                  </div>
                  <div className="buddy-date-row">
                    <span className="buddy-date-label">Ends:</span>
                    <span className="buddy-date-value">{endDate}</span>
                  </div>
                </div>
              </Link>
            );
          }) : <p className="empty-text">No buddy reads found.</p>}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Shelf</h2>
            <form onSubmit={handleCreateShelf}>
              <div className="form-group">
                <label>Shelf Name</label>
                <input 
                  type="text" 
                  required 
                  value={newShelf.name}
                  onChange={(e) => setNewShelf({...newShelf, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <select 
                  value={newShelf.isPrivate} 
                  onChange={(e) => setNewShelf({...newShelf, isPrivate: e.target.value === 'true'})}
                >
                  <option value="false">Public</option>
                  <option value="true">Private</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-cta">Create Shelf</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;