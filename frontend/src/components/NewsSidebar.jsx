import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from './NewsSidebar.module.css';

const NewsSidebar = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('news_sidebar_collapsed') === 'true';
    });

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                const newsData = Array.isArray(res.data) ? res.data : (res.data?.news || []);
                setNews(newsData);
            } catch (err) {
                console.error('Failed to load news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('news_sidebar_collapsed', newState);
    };

    const sortedNews = [...news].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
            return b.is_pinned ? 1 : -1;
        }
        return new Date(b.publish_date) - new Date(a.publish_date);
    });

    if (loading || news.length === 0) return null;

    if (isCollapsed) {
        return (
            <div className={styles.collapsedContainer} onClick={toggleCollapse} title="Expand News">
                <svg className={styles.expandIcon} viewBox="0 0 24 24">
                    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
            </div>
        );
    }

    return (
        <div className={styles.newsContainer}>
            <div className={styles.sidebarHeader}>
                <h4 className={styles.sidebarTitle} onClick={toggleCollapse} style={{ cursor: 'pointer' }}>
                    📢 Community News
                </h4>
                <button onClick={toggleCollapse} className={styles.collapseIconBtn} title="Collapse sidebar">
                    <svg viewBox="0 0 24 24">
                        <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                    </svg>
                </button>
            </div>

            <div className={styles.newsList}>
                {sortedNews.map(item => (
                    <div key={item.id} className={`${styles.newsCard} ${item.is_pinned ? styles.pinnedCard : ''}`}>
                        <div className={styles.newsHeaderRow}>
                            <Link to={`/news/${item.id}`} className={styles.newsCardTitleLink}>
                                {item.title}
                            </Link>
                            {Boolean(item.is_pinned) && (
                                <span className={styles.pinnedBadge} title="Pinned announcement">📌</span>
                            )}
                        </div>
                        <p className={styles.newsCardContent}>{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsSidebar;