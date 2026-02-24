import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AddLogPage.css';

const AddLogPage = () => {
    const { bookId } = useParams(); 
    const navigate = useNavigate();
    
    const [currentPage, setCurrentPage] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/logs/progress', {
                bookID: bookId, 
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
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea 
                            className="form-textarea"
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn-cta btn-submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Log'}
                        </button>
                        <button type="button" className="btn-secondary btn-cancel" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLogPage;