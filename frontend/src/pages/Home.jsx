import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import NewsSidebar from '../components/NewsSidebar';
import styles from './Home.module.css';

const getCategoryIcon = (title) => {
    switch (title) {
        case 'On Foot / Hiking':
            return <svg viewBox="0 0 24 24" className={styles.icon}><path d="M14.08,15.59L15.3,16.81L10.36,21.75L6.11,17.5L8.59,15.03L10.36,16.8L14.08,15.59M16.5,7.5A2.5,2.5 0 0,1 19,10A2.5,2.5 0 0,1 16.5,12.5A2.5,2.5 0 0,1 14,10A2.5,2.5 0 0,1 16.5,7.5M10.15,10.66L12.35,9.55C13,9.22 13.78,9.5 14.11,10.16L15.5,12.92C15.74,13.4 15.54,13.97 15.07,14.21C14.59,14.45 14.03,14.26 13.78,13.78L12.72,11.66L10.22,12.9L11.5,16.82L9.6,17.43L8.04,12.63L10.15,10.66Z" /></svg>;
        case 'Bicycles':
            return <svg viewBox="0 0 24 24" className={styles.icon}><path d="M15.5,5.5C15.5,4.12 16.62,3 18,3C19.38,3 20.5,4.12 20.5,5.5C20.5,6.88 19.38,8 18,8C16.62,8 15.5,6.88 15.5,5.5M5,12C2.24,12 0,14.24 0,17C0,19.76 2.24,22 5,22C7.76,22 10,19.76 10,17C10,14.24 7.76,12 5,12M5,20.5C3.07,20.5 1.5,18.93 1.5,17C1.5,15.07 3.07,13.5 5,13.5C6.93,13.5 8.5,15.07 8.5,17C8.5,18.93 6.93,20.5 5,20.5M19,12C16.24,12 14,14.24 14,17C14,19.76 16.24,22 19,22C21.76,22 24,19.76 24,17C24,14.24 21.76,12 19,12M19,20.5C17.07,20.5 15.5,18.93 15.5,17C15.5,15.07 17.07,13.5 19,13.5C20.93,13.5 22.5,15.07 22.5,17C22.5,18.93 20.93,20.5 19,20.5M10.8,10.6L12.4,9L13.7,10.3C14.7,11.3 16.1,12 17.6,12V10.5C16.5,10.5 15.5,10 14.8,9.3L13.2,7.7C12.8,7.3 12.2,7 11.6,7C11.1,7 10.5,7.2 10.1,7.6L6.3,11.4L7.4,12.5L10.8,9.1L10.2,12.2L12,17H13.6L12,11.2L10.8,10.6Z" /></svg>;
        case 'Electric Mopeds':
            return <svg viewBox="0 0 24 24" className={styles.icon}><path d="M19,7A2,2 0 0,1 21,9A2,2 0 0,1 19,11A2,2 0 0,1 17,9A2,2 0 0,1 19,7M6,13V15.5H8.62L11.5,11.17L9.83,9.5L6.62,11H3V13H6M19,13C16.24,13 14,15.24 14,18C14,20.76 16.24,23 19,23C21.76,23 24,20.76 24,18C24,15.24 21.76,13 19,13M19,21C17.34,21 16,19.66 16,18C16,16.34 17.34,15 19,15C20.66,15 22,16.34 22,18C22,19.66 20.66,21 19,21M5,13C2.24,13 0,15.24 0,18C0,20.76 2.24,23 5,23C7.76,23 10,20.76 10,18C10,15.24 7.76,13 5,13M5,21C3.34,21 2,19.66 2,18C2,16.34 3.34,15 5,15C6.66,15 8,16.34 8,18C8,19.66 6.66,21 5,21M13.25,12.75L12,14.63V18H10.5V13.88L11.85,11.8L13.25,12.75Z" /></svg>;
        case 'Public Transport':
            return <svg viewBox="0 0 24 24" className={styles.icon}><path d="M12,2C15.87,2 19,3.5 19,6V16.5C19,17.88 17.88,19 16.5,19H16V20.5A1.5,1.5 0 0,1 14.5,22A1.5,1.5 0 0,1 13,20.5V19H11V20.5A1.5,1.5 0 0,1 9.5,22A1.5,1.5 0 0,1 8,20.5V19H7.5C6.12,19 5,17.88 5,16.5V6C5,3.5 8.13,2 12,2M8.5,13.5A1.5,1.5 0 0,0 7,15A1.5,1.5 0 0,0 8.5,16.5A1.5,1.5 0 0,0 10,15A1.5,1.5 0 0,0 8.5,13.5M15.5,13.5A1.5,1.5 0 0,0 14,15A1.5,1.5 0 0,0 15.5,16.5A1.5,1.5 0 0,0 17,15A1.5,1.5 0 0,0 15.5,13.5M17,11V6H7V11H17Z" /></svg>;
        case 'Car Camping':
            return <svg viewBox="0 0 24 24" className={styles.icon}><path d="M14.12,10.66L17.58,16.66L19.31,15.66L15.85,9.66L14.12,10.66M11,10.03L9.27,11.03L12.73,17.03L14.46,16.03L11,10.03M12,4.8L2.5,21.5H5.8L7.33,18.84L12,10.74L16.67,18.84L18.2,21.5H21.5L12,4.8Z" /></svg>;
        default:
            return <svg viewBox="0 0 24 24" className={styles.icon}><path d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M23.4 13L21.5 11.2L18.4 14.3L15.3 11.2L13.4 13L16.5 16.2L13.4 19.3L15.3 21.1L18.4 18L21.5 21.1L23.4 19.3L20.3 16.2L23.4 13Z" /></svg>;
    }
};

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearchQuery = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';

    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    const [sortBy, setSortBy] = useState('rating');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                const catData = Array.isArray(res.data) ? res.data : (res.data?.categories || []);
                setCategories(catData);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = { page, limit: 10, sortBy, sortOrder };
            if (urlSearchQuery.trim()) queryParams.search = urlSearchQuery.trim();
            if (urlCategory) queryParams.category = urlCategory;

            const response = await api.get('/posts', { params: queryParams });

            if (response.data && response.data.pagination) {
                setPosts(response.data.data || []);
                setTotalPages(response.data.pagination.totalPages || 1);
            } else if (Array.isArray(response.data)) {
                setPosts(response.data);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [urlSearchQuery, urlCategory, sortBy, sortOrder, page]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleClearSearch = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('search');
        setSearchParams(newParams);
    };

    const handleCategoryClick = (categoryId) => {
        const newParams = new URLSearchParams(searchParams);
        
        if (!categoryId) {
            newParams.delete('category');
        } else {
            newParams.set('category', categoryId);
        }
        
        setSearchParams(newParams);
        setPage(1);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
        } catch (err) {
            console.error('Failed to delete post:', err);
            alert('Failed to delete post.');
        }
    };

    useEffect(() => {
        setPage(1);
    }, [urlSearchQuery, urlCategory, sortBy, sortOrder]);

    return (
        <div className={styles.pageLayout}>
            <NewsSidebar />

            <main className={styles.mainContent}>
                <div className={styles.chipsContainer}>
                    <div 
                        className={`${styles.chip} ${!urlCategory ? styles.chipActive : ''}`} 
                        onClick={() => handleCategoryClick('')}
                    >
                        <svg viewBox="0 0 24 24" className={styles.icon}><path d="M4 6H20V8H4V6M4 11H20V13H4V11M4 16H20V18H4V16Z" /></svg>
                        All Locations
                    </div>
                    {categories.map(cat => (
                        <div 
                            key={cat.id}
                            className={`${styles.chip} ${urlCategory === String(cat.id) ? styles.chipActive : ''}`}
                            onClick={() => handleCategoryClick(cat.id)}
                        >
                            {getCategoryIcon(cat.title)}
                            {cat.title}
                        </div>
                    ))}
                </div>

                {urlSearchQuery && (
                    <div className={styles.activeSearchNotice}>
                        <span className={styles.searchNoticeText}>
                            Search results for: <strong>"{urlSearchQuery}"</strong>
                        </span>
                        <button onClick={handleClearSearch} className={styles.clearSearchBtn}>
                            <svg viewBox="0 0 24 24">
                                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                            </svg>
                            Clear Search
                        </button>
                    </div>
                )}

                <div className={styles.feedHeader}>
                    <h3 className={styles.feedTitle}>
                        {urlCategory 
                            ? categories.find(c => String(c.id) === urlCategory)?.title || 'Locations'
                            : 'Discover Places'}
                    </h3>

                    <div className={styles.sortGroup}>
                        <span className={styles.sortLabel}>Sort by:</span>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                                setPage(1);
                            }}
                            className={styles.select}
                        >
                            <option value="rating-DESC">Top Rated</option>
                            <option value="rating-ASC">Lowest Rated</option>
                            <option value="publish_date-DESC">Newest First</option>
                            <option value="publish_date-ASC">Oldest First</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div>Loading spots...</div>
                ) : posts.length === 0 ? (
                    <p style={{ marginTop: '20px' }}>No spots found matching your criteria.</p>
                ) : (
                    posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onPostUpdate={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
                            onDelete={handleDeletePost} 
                        />
                    ))
                )}

            {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button disabled={page <= 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))} className={styles.btn}>
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(prev => prev + 1)} className={styles.btn}>
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;