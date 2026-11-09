import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';

const CreatePost = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user && user.role === 'admin';

    const [postType, setPostType] = useState('post');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        e.target.value = null;
    };

    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(Array.isArray(response.data) ? response.data : (response.data?.categories || []));
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryChange = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            return setStatus({ type: 'error', message: 'Title and content are required.' });
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            if (isAdmin && postType === 'news') {
                await api.post('/news', { 
                    title, 
                    content, 
                    is_pinned: false 
                });

                setStatus({ type: 'success', message: 'News published successfully! Redirecting...' });
            } else {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', content);
                formData.append('categories', JSON.stringify(selectedCategories));

                selectedFiles.forEach((file) => {
                    formData.append('images', file);
                });

                const response = await api.post('/posts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const newPostId = response.data?.postId || response.data?.id || response.data?.insertId;
                
                setStatus({ type: 'success', message: 'Post published successfully! Redirecting...' });

                setTimeout(() => {
                    if (newPostId) {
                        navigate(`/posts/${newPostId}`);
                    } else {
                        navigate('/');
                    }
                }, 1000);
                return;
            }

            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.error || 'Failed to create publication.' 
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '750px', margin: '40px auto', backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <h2 style={{ borderBottom: '2px solid #eaeaea', paddingBottom: '10px', marginBottom: '25px', color: '#2c3e50' }}>
                {isAdmin && postType === 'news' ? 'Create Official News' : 'Create a New Post'}
            </h2>

            {status.message && (
                <div style={{
                    padding: '12px 15px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: status.type === 'error' ? '#ffebee' : '#e8f5e9',
                    color: status.type === 'error' ? '#c0392b' : '#27ae60',
                    fontWeight: '600',
                    textAlign: 'center'
                }}>
                    {status.message}
                </div>
            )}

            {isAdmin && (
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        <input 
                            type="radio" 
                            name="postType" 
                            value="post" 
                            checked={postType === 'post'} 
                            onChange={() => setPostType('post')} 
                        />
                        Regular Post (Spot)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        <input 
                            type="radio" 
                            name="postType" 
                            value="news" 
                            checked={postType === 'news'} 
                            onChange={() => setPostType('news')} 
                        />
                        Sidebar News
                    </label>
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                    <label style={styles.label}>Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Give your title here..." 
                        required 
                        style={styles.input}
                    />
                </div>

                {(!isAdmin || postType === 'post') && (
                    <div style={styles.field}>
                        <label style={styles.label}>Upload Images (Up to 5)</label>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleFileChange}
                            style={{ padding: '8px 0', fontSize: '0.9em' }}
                        />
                        
                        {selectedFiles.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', border: '1px solid #ccd1d9', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
                                        <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveFile(idx)}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '4px', 
                                                right: '4px', 
                                                background: 'rgba(0, 0, 0, 0.75)', 
                                                color: '#fff', 
                                                border: 'none', 
                                                borderRadius: '50%', 
                                                width: '22px', 
                                                height: '22px', 
                                                cursor: 'pointer', 
                                                fontSize: '0.75em', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontWeight: 'bold'
                                            }}
                                            title="Remove image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(!isAdmin || postType === 'post') && categories.length > 0 && (
                    <div style={styles.field}>
                        <label style={styles.label}>Categories</label>
                        <div style={styles.categoryContainer}>
                            {categories.map(cat => (
                                <label 
                                    key={cat.id} 
                                    style={{
                                        ...styles.checkboxLabel,
                                        backgroundColor: selectedCategories.includes(cat.id) ? '#3498db' : '#f8f9fa',
                                        color: selectedCategories.includes(cat.id) ? '#fff' : '#333',
                                        borderColor: selectedCategories.includes(cat.id) ? '#3498db' : '#ccd1d9'
                                    }}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCategories.includes(cat.id)}
                                        onChange={() => handleCategoryChange(cat.id)}
                                        style={{ display: 'none' }}
                                    />
                                    {cat.title}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div style={styles.field}>
                    <label style={styles.label}>Content</label>
                    <textarea 
                        rows="10" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        placeholder="Write your content here..." 
                        required 
                        style={styles.textarea}
                    />
                </div>

                <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                    {isSubmitting ? 'Publishing...' : (isAdmin && postType === 'news' ? 'Publish News' : 'Publish Post')}
                </button>
            </form>
        </div>
    );
};

const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontWeight: '600', color: '#34495e', fontSize: '0.95em' },
    input: { padding: '12px 14px', fontSize: '0.95em', borderRadius: '8px', border: '1px solid #ccd1d9', outline: 'none' },
    textarea: { padding: '12px 14px', fontSize: '0.95em', borderRadius: '8px', border: '1px solid #ccd1d9', resize: 'vertical', lineHeight: '1.5', outline: 'none', fontFamily: 'inherit' },
    categoryContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    checkboxLabel: { padding: '6px 14px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600', userSelect: 'none', transition: 'all 0.2s ease' },
    submitBtn: { padding: '12px 24px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', alignSelf: 'flex-start', marginTop: '10px' }
};

export default CreatePost;