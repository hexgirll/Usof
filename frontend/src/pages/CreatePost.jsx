import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreatePost = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch available categories from backend on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Toggle category selection
    const handleCategoryChange = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // Handle post creation submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            return setStatus({ type: 'error', message: 'Title and content are required.' });
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('/posts', {
                title,
                content,
                categories: selectedCategories
            });

            // Extract new post ID safely across various controller response formats
            const newPostId = response.data?.postId || response.data?.id || response.data?.insertId;
            
            if (newPostId) {
                navigate(`/posts/${newPostId}`);
            } else {
                navigate('/');
            }
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.error || 'Failed to create post.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2>Create New Post</h2>

            {status.message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    color: status.type === 'error' ? 'red' : 'green',
                    border: `1px solid ${status.type === 'error' ? 'red' : 'green'}`
                }}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                    <label style={styles.label}>Post Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Enter post title..." 
                        required 
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Select Categories</label>
                    <div style={styles.categoryContainer}>
                        {categories.map(category => (
                            <label key={category.id} style={styles.checkboxLabel}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedCategories.includes(category.id)} 
                                    onChange={() => handleCategoryChange(category.id)}
                                />
                                {category.title}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Content</label>
                    <textarea 
                        rows="8" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        placeholder="Write your post content here..." 
                        required 
                        style={styles.textarea}
                    />
                </div>

                <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                    {isSubmitting ? 'Publishing...' : 'Publish Post'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontWeight: 'bold', color: '#2c3e50' },
    input: { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' },
    textarea: { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' },
    categoryContainer: { display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9em' },
    submitBtn: { padding: '12px 20px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em', alignSelf: 'flex-start' }
};

export default CreatePost;