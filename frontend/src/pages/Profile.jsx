import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Profile.css';

const Profile = ({ user }) => {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newShelf, setNewShelf] = useState({ name: '', isPrivate: false });

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      const res = await api.get('/shelf');
      setShelves(res.data.shelves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (loading) return <p>Loading your library...</p>;

  return (
    <div className="profile-page">
      { }
      <header className="profile-header-container">
        <div className="user-info">
          <h1>Welcome, {user.name}</h1>
          <p className="username-display">@{user.username}</p>
        </div>
        <button className="btn-cta" onClick={() => setShowModal(true)}>
          + Create New Shelf
        </button>
      </header>

      <div className="shelf-grid">
        {shelves.length > 0 ? shelves.map(shelf => (
          <Link to={`/shelf/${shelf.name}`} key={shelf._id} className="shelf-card">
            <h3>{shelf.name}</h3>
            <span className="shelf-state">{shelf.isPrivate ? "Private" : "Public"}</span>
          </Link>
        )) : <p>No shelves found. Create one to get started!</p>}
      </div>

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