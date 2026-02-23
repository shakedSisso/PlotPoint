import React from 'react';
import { Link } from 'react-router-dom';
// import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-cta">Return Home</Link>
    </div>
  );
};

export default NotFound;
