import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AddLogPage.css';

const AddLogPage = () => {
    const { bookId } = useParams(); 
    const navigate = useNavigate();
    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?._id || storedUser?.id;

    const [currentPage, setCurrentPage] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userId) {
            alert("User not found. Please log in again.");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/logs/progress', {
                bookID: bookId,
                userID: userId,
                currentPage: Number(currentPage),
                note: note
            });

            if (res.data.success) {
                navigate(`/book/${bookId}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving log");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="log-container">
            <header className="log-header">
                <h2>Update Your Progress</h2>
                <p>Track your reading journey</p>
            </header>

            <div className="log-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Current Page</label>
                        <input 
                            type="number" 
                            className="form-input"
                            value={currentPage} 
                            onChange={(e) => setCurrentPage(e.target.value)} 
                            required 
                            placeholder="Enter page number"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Notes & Thoughts</label>
                        <textarea 
                            className="form-textarea"
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            placeholder="Write your notes here..."
                        />
                    </div>

                    <div className="button-group">
                        <button 
                            type="submit" 
                            className="btn-cta btn-submit" 
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Log'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary btn-cancel" 
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLogPage;