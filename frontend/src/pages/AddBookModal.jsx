import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./AddBookModal.css";

const cleanIsbnInput = (raw) => String(raw || "").replace(/[^0-9Xx]/g, "").trim();

const parsePagesToNumber = (value) => {
    if (typeof value === "number") return value;
    if (value === null || value === undefined) return 0;

    const match = String(value).match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const pickCategoryNameFromOpenLibrary = (b) => {
    const fromSubjects = Array.isArray(b.subjects) ? b.subjects[0]?.name : null;
    const fromSubject = Array.isArray(b.subject) ? b.subject[0] : null;
    const fromGenres = Array.isArray(b.genres) ? b.genres[0]?.name : null;

    return (fromSubjects || fromSubject || fromGenres || "General").toString().trim();
};

const getStableCoverByIsbn = (isbn) =>
    `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`;

const pickCoverFromOpenLibrary = (b, isbn) => {
    return b.cover?.large || b.cover?.medium || b.cover?.small || getStableCoverByIsbn(isbn);
};

const pickCoverFromGoogle = (v, isbn) => {
    let url = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || "";

    if (url) {
        url = url.replace("http://", "https://");

        // חשוב: להגדיל איכות
        url = url.replace("&edge=curl", "");
        if (!url.includes("zoom=")) {
            url += (url.includes("?") ? "&" : "?") + "zoom=1";
        }

        return url;
    }

    // רק אם אין בכלל thumbnail → fallback ל-OpenLibrary
    return getStableCoverByIsbn(isbn);
};

const initialState = {
    isbn: "",
    bookData: null,
    error: "",
    duplicateId: null,
    isFinding: false,
    isSaving: false,
};

const AddBookModal = ({ isOpen, onClose }) => {
    const [isbn, setIsbn] = useState(initialState.isbn);
    const [bookData, setBookData] = useState(initialState.bookData);
    const [error, setError] = useState(initialState.error);
    const [duplicateId, setDuplicateId] = useState(initialState.duplicateId);
    const [isFinding, setIsFinding] = useState(initialState.isFinding);
    const [isSaving, setIsSaving] = useState(initialState.isSaving);

    const navigate = useNavigate();

    const resetState = () => {
        setIsbn(initialState.isbn);
        setBookData(initialState.bookData);
        setError(initialState.error);
        setDuplicateId(initialState.duplicateId);
        setIsFinding(initialState.isFinding);
        setIsSaving(initialState.isSaving);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) resetState();
    }, [isOpen]);

    const fetchFromOpenLibrary = async () => {
        setError("");
        setBookData(null);
        setDuplicateId(null);
        setIsFinding(true);

        try {
            const cleanIsbn = cleanIsbnInput(isbn);

            if (!cleanIsbn) {
                setError("Please enter a valid ISBN.");
                return;
            }

            // 1) OpenLibrary
            const olUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
            const olRes = await fetch(olUrl);
            const olData = await olRes.json();
            const olKey = `ISBN:${cleanIsbn}`;

            if (olData[olKey]) {
                const b = olData[olKey];

                const title = b.title || "Untitled";
                const author = b.authors?.[0]?.name || b.by_statement || "Unknown Author";
                const categoryName = pickCategoryNameFromOpenLibrary(b);
                const coverImage = pickCoverFromOpenLibrary(b, cleanIsbn);

                const pagesRaw = b.number_of_pages ?? b.pagination ?? 0;
                const length = parsePagesToNumber(pagesRaw);

                setBookData({
                    isbn: cleanIsbn,
                    name: title,
                    author,
                    coverImage,
                    length,
                    categoryName,
                });

                return;
            }

            // 2) Google Books fallback
            const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;
            const gbRes = await fetch(gbUrl);
            const gbData = await gbRes.json();

            const item = gbData.items?.[0];
            if (!item) {
                setError("ISBN not found (OpenLibrary + Google Books).");
                return;
            }

            const v = item.volumeInfo || {};

            const title = v.title || "Untitled";
            const author = v.authors?.[0] || "Unknown Author";
            const length = Number.isFinite(v.pageCount) ? v.pageCount : 0;

            const coverImage = pickCoverFromGoogle(v, cleanIsbn);
            const categoryName = v.categories?.[0] || "General";

            setBookData({
                isbn: cleanIsbn,
                name: title,
                author,
                coverImage,
                length,
                categoryName,
            });
        } catch (err) {
            console.error("ISBN fetch error:", err);
            setError("Connection error. Try again.");
        } finally {
            setIsFinding(false);
        }
    };

    const handleSave = async () => {
        if (!bookData) return;

        setError("");
        setDuplicateId(null);
        setIsSaving(true);

        try {
            const payload = {
                ...bookData,
                length: Number.isFinite(Number(bookData.length)) ? Number(bookData.length) : 0,
                coverImage: bookData.coverImage || "",
                categoryName: (bookData.categoryName || "General").toString().trim(),
                name: (bookData.name || "Untitled").toString().trim(),
                author: (bookData.author || "Unknown Author").toString().trim(),
            };

            const res = await api.post("/books/add-by-isbn", payload);

            if (res.data?.success) {
                const newId = res.data.book?._id;
                handleClose();
                if (newId) navigate(`/book/${newId}`);
            } else {
                setError("Failed to save book.");
            }
        } catch (err) {
            console.error("Save failed:", err);
            if (err.response?.status === 409) {
                setError("Book already exists in library.");
                setDuplicateId(err.response.data.bookId);
            } else {
                setError(err.response?.data?.message || "Server connection error.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Add to Library</h2>
                    <button className="close-x" onClick={handleClose} aria-label="Close">
                        &times;
                    </button>
                </header>

                <div className="isbn-row">
                    <input
                        placeholder="Enter ISBN (e.g., 9780140328721)"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") fetchFromOpenLibrary();
                        }}
                    />
                    <button className="btn-cta" onClick={fetchFromOpenLibrary} disabled={isFinding}>
                        {isFinding ? "Searching..." : "Find"}
                    </button>
                </div>

                {error && (
                    <div className="error-container">
                        <p className="modal-error">{error}</p>

                        {duplicateId && (
                            <button
                                className="btn-cta secondary"
                                onClick={() => {
                                    navigate(`/book/${duplicateId}`);
                                    handleClose();
                                }}
                            >
                                View Existing Book
                            </button>
                        )}
                    </div>
                )}

                {bookData && !duplicateId && (
                    <div className="modal-preview">
                        <div className="preview-cover">
                            {bookData.coverImage ? (
                                <img
                                    src={bookData.coverImage}
                                    alt="cover"
                                    onError={(e) => {
                                        // If image fails, fallback to stable OpenLibrary cover by ISBN
                                        const safeIsbn = cleanIsbnInput(isbn);
                                        e.currentTarget.src = safeIsbn ? getStableCoverByIsbn(safeIsbn) : "";
                                    }}
                                />
                            ) : (
                                <div className="cover-placeholder">{bookData.name?.charAt(0) || "B"}</div>
                            )}
                        </div>

                        <div className="preview-details">
                            <h3>{bookData.name}</h3>
                            <p className="author">by {bookData.author}</p>
                            <span className="category-suggestion">Category: {bookData.categoryName}</span>
                            <span className="category-suggestion">Pages: {bookData.length || "Unknown"}</span>

                            <button className="btn-cta" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Confirm & Add"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddBookModal;