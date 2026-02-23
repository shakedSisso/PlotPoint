import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // הוספנו את useSearchParams
import api from '../utils/api';
import AddBookModal from './AddBookModal';
import './Explore.css';
import '../index.css'

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // חיבור לפרמטרים בכתובת ה-URL
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/books');
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBooks(sorted);
        setFilteredBooks(sorted);

        const uniqueCats = ["All", ...new Set(sorted.map(b => b.category?.name).filter(Boolean))];
        setCategories(uniqueCats);

        // אם הגענו מהדף הראשי עם קטגוריה ב-URL, נעדכן את ה-State
        if (categoryQuery && uniqueCats.includes(categoryQuery)) {
          setSelectedCategory(categoryQuery);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, [categoryQuery]); // ה-Effect ירוץ שוב אם הקטגוריה ב-URL משתנה

  useEffect(() => {
    const filtered = books.filter(book => {
      const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "All" || book.category?.name === selectedCategory;
      return matchesSearch && matchesCat;
    });
    setFilteredBooks(filtered);
  }, [searchTerm, selectedCategory, books]);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <header className="explore-header">
        <h1>Explore Library</h1>
        <div className="header-divider"></div>
      </header>

      <section className="search-filter-area">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search books or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="custom-select-container">
          <div className={`selected-display ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <span>{selectedCategory}</span>
            <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
          </div>
          {isOpen && (
            <div className="custom-options-list">
              {categories.map(cat => (
                <div key={cat} className="custom-option" onClick={() => { setSelectedCategory(cat); setIsOpen(false); }}>
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="books-grid explore-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <Link to={`/book/${book._id}`} key={book._id} className="book-card explore-card">
              <div className="book-cover">
                <img src={book.coverImage} alt={book.name} />
              </div>
              <div className="book-info">
                <h3>{book.name}</h3>
                <p>{book.author}</p>
                <span className="category-tag">{book.category?.name || "General"}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-results-box">
            <p>We couldn't find "{searchTerm}"</p>
            <button className="btn-cta" onClick={() => setShowModal(true)}>+ Add This Book</button>
          </div>
        )}
      </div>

      <AddBookModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Explore;