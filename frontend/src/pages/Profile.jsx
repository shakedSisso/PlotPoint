import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Profile.css';

const Profile = ({ user }) => {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      const res = await api.get('/shelf');
      console.log(res);
      setShelves(res.data.shelves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading your library...</p>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>Welcome, {user.name}</h1>
        <p>@{user.username}</p>
      </header>

      <div className="shelf-grid">
        {shelves.length > 0 ? shelves.map(shelf => (
          <Link to={`/shelf/${shelf.name}`} key={shelf._id} className="shelf-card">
            <h3>{shelf.name}</h3>
            <span className="shelf-state">{shelf.isPrivate ? "Private" : "Public"}</span>
          </Link>
        )) : <p>No shelves found. Create one to get started!</p>}
      </div>
    </div>
  );
};

export default Profile;