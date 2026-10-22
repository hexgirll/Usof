import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [statusVal, setStatusVal] = useState('active');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    
    // Змінна, що чітко визначає: це чужий пост чи ні
    const [isForeignPost, setIsForeignPost] = useState(false);
    
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPostAndCategories = async () => {
            try {
                const [postRes, catRes, postCatRes] = await Promise.all([
                    api.get(`/posts/${id}`),
                    api.get('/categories'),
                    api.get(`/posts/${id}/categories`)
                ]);

                setTitle(postRes.data.title);
                setContent(postRes.data.content);
                setStatusVal(postRes.data.status || 'active');
                setCategories(catRes.data);
                setSelectedCategories(postCatRes.data.map(c => c.id));
                
                // Якщо ID користувача не збігається з автором поста — це чужий пост (адмінський режим)
                if (user && user.id !== postRes.data.author_id) {
                    setIsForeignPost(true);
                } else {
                    setIsForeignPost(false);
                }
            } catch (err) {
                setStatus({ type: 'error', message: 'Failed to load post data for editing.' });
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPostAndCategories();
        }
    }, [id, user]);

    const handleCategoryChange = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(cId => cId !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const payload = { status: statusVal, categories: selectedCategories };
            
            // Відправляємо Title і Content тільки якщо це НЕ чужий пост
            if (!isForeignPost) {
                payload.title = title;
                payload.content = content;
            }

            await api.patch(`/posts/${id}`, payload);
            setStatus({ type: 'success', message: 'Post updated successfully!' });
            setTimeout(() => navigate(`/posts/${id}`), 1200);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update post.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Loading post for editing...</div>;

    // Стиль для заблокованих полів: сірий фон, інший колір тексту, курсор-заборона
    const inputStyle = isForeignPost 
        ? { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e9ecef', color: '#6c757d', cursor: 'not-allowed' }
        : { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#000' };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2>Edit Post</h2>

            {isForeignPost && (
                <div style={styles.adminWarning}>
                    <strong>Admin Mode:</strong> You are editing someone else's post. You can only change the <u>Status</u> and <u>Categories</u>. Text fields are locked.
                </div>
            )}

            {status.message && (
                <div style={{ padding: '10px', marginBottom: '15px', color: status.type === 'error' ? 'red' : 'green', border: `1px solid ${status.type === 'error' ? 'red' : 'green'}` }}>
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
                        required={!isForeignPost}
                        disabled={isForeignPost}
                        style={inputStyle}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Post Status (Admin / Owner control)</label>
                    <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)} style={styles.select}>
                        <option value="active">Active (Visible to public)</option>
                        <option value="inactive">Inactive (Hidden from public feed)</option>
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Select Categories (Admin / Owner control)</label>
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
                        required={!isForeignPost}
                        disabled={isForeignPost}
                        style={inputStyle}
                    />
                </div>

                <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    adminWarning: { backgroundColor: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #ffeeba', lineHeight: '1.5' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontWeight: 'bold' },
    select: { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' },
    categoryContainer: { display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '15px', backgroundColor: '#f4f6f8', borderRadius: '6px', border: '1px solid #ddd' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' },
    submitBtn: { padding: '12px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.05em', fontWeight: 'bold' }
};

export default EditPost;