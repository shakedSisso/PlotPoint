import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import '../index.css';
import './Explore.css';

const Explore = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom dropdown state
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/books');
        
        const sortedBooks = res.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBooks(sortedBooks);
        setFilteredBooks(sortedBooks);

        const uniqueCategories = ["All", ...new Set(sortedBooks.map(book => book.category?.name).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching explore data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book => {
      const matchesSearch = 
        book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || 
        book.category?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
    setFilteredBooks(filtered);
  }, [searchTerm, selectedCategory, books]);

  if (loading) return <div className="explore-loading">Loading books...</div>;

  return (
    <div className="explore-page-container">
      <header className="explore-header">
        <h1>Explore Library</h1>
        <div className="header-divider"></div>
      </header>

      <section className="search-filter-area">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Search by book name or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Custom Dropdown Replacement */}
        <div className="category-filter-wrapper">
          <div className="custom-select-container">
            <div 
              className={`selected-display ${isOpen ? 'active' : ''}`} 
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>{selectedCategory}</span>
              <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>

            {isOpen && (
              <div className="custom-options-list">
                {categories.map(cat => (
                  <div 
                    key={cat} 
                    className={`custom-option ${selectedCategory === cat ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsOpen(false);
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="explore-books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <Link to={`/book/${book._id}`} key={book._id} className="explore-book-card">
              <div className="book-cover-mini">
                <img src={book.coverImage} alt={book.name} />
              </div>
              <div className="explore-book-info">
                <h3>{book.name}</h3>
                <p>{book.author}</p>
                <span className="category-tag">{book.category?.name || "General"}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-results">
            <p>No books found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;