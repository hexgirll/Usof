import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearchQuery = searchParams.get('search') || '';

    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Default sorting is by Rating (Likes) as required by project specs
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Fetch categories for dropdown filter
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

    // Fetch posts directly using backend pagination, sorting, and search
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = {
                page,
                limit: 10,
                sortBy,
                sortOrder
            };

            if (urlSearchQuery.trim()) queryParams.search = urlSearchQuery.trim();
            if (selectedCategory) queryParams.category = selectedCategory;

            const response = await api.get('/posts', { params: queryParams });

            // Standardized response parsing from backend
            if (response.data && response.data.pagination) {
                setPosts(response.data.data || []);
                setTotalPages(response.data.pagination.totalPages || 1);
            } else if (Array.isArray(response.data)) {
                // Fallback if backend returns plain array
                setPosts(response.data);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [urlSearchQuery, selectedCategory, sortBy, sortOrder, page]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleClearSearch = () => {
        searchParams.delete('search');
        setSearchParams(searchParams);
    };

    // Reset page to 1 whenever search query, category, or sorting changes
    useEffect(() => {
        setPage(1);
    }, [urlSearchQuery, selectedCategory, sortBy, sortOrder]);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2>Feed Posts</h2>

            {urlSearchQuery && (
                <div style={styles.activeSearchNotice}>
                    <span>Search results for: <strong>"{urlSearchQuery}"</strong></span>
                    <button onClick={handleClearSearch} style={styles.clearSearchBtn}>Clear Search</button>
                </div>
            )}

            <div style={styles.filterBar}>
                <div style={styles.selectGroup}>
                    <label style={styles.label}>Category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        style={styles.select}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.selectGroup}>
                    <label style={styles.label}>Sort By:</label>
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field);
                            setSortOrder(order);
                            setPage(1);
                        }}
                        style={styles.select}
                    >
                        <option value="rating-DESC">Highest Rating (Default)</option>
                        <option value="rating-ASC">Lowest Rating</option>
                        <option value="publish_date-DESC">Newest First</option>
                        <option value="publish_date-ASC">Oldest First</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div>Loading posts...</div>
            ) : posts.length === 0 ? (
                <p style={{ marginTop: '20px' }}>No posts found matching your criteria.</p>
            ) : (
                posts.map(post => <PostCard key={post.id} post={post} />)
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        style={styles.btn}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(prev => prev + 1)}
                        style={styles.btn}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    activeSearchNotice: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f4fc', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #3498db' },
    clearSearchBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em' },
    filterBar: { display: 'flex', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '6px', alignItems: 'center' },
    selectGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    label: { fontWeight: 'bold', fontSize: '0.9em', color: '#333' },
    select: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    btn: { padding: '8px 15px', cursor: 'pointer' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px' }
};

export default Home;