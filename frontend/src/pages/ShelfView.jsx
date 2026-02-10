import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

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

  return (
    <div className="shelf-view">
      <h1>{shelfName}</h1>
      <div className="book-grid">
        {books.map(entry => (
          <Link to={`/book/${entry.bookId._id}`} key={entry._id} className="book-card">
            <h4>{entry.bookId.name}</h4>
            <p>{entry.bookId.author}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShelfView;