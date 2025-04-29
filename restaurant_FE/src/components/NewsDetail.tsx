import type React from "react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "../css/NewsDetail.module.css";

function NewsDetail() {
    const [news, setNews] = useState<any[]>([]);
    const [category, setCategory] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchNews = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = category ? `http://localhost:3000/news?category=${category}` : "http://localhost:3000/news";
            const response = await axios.get(url);
            setNews(response.data.news);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setIsLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getCategoryClass = (category: string) => {
        switch (category) {
            case "Promotion":
                return styles.promotionBadge;
            case "New Dish":
                return styles.newDishBadge;
            case "Event":
                return styles.eventBadge;
            case "Restaurant News":
                return styles.restaurantNewsBadge;
            default:
                return styles.defaultBadge;
        }
    };

    return (
        <div className={styles.newsContainer}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Ambrosia News</h2>
                    <p className={styles.subtitle}>Stay updated with the latest promotions, events, and restaurant news</p>
                </div>

                {/* Bộ lọc danh mục */}
                <div className={styles.filterContainer}>
                    <div className={styles.selectWrapper}>
                        <select value={category} onChange={handleCategoryChange} className={styles.categorySelect}>
                            <option value="">All Categories</option>
                            <option value="Promotion">Promotion</option>
                            <option value="New Dish">New Dish</option>
                            <option value="Event">Event</option>
                            <option value="Restaurant News">Restaurant News</option>
                        </select>
                        <span className={styles.arrowDown}></span>
                    </div>
                </div>

                {isLoading ? (
                    <div className={styles.newsList}>
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className={`${styles.newsRow} ${styles.skeleton}`}>
                                <div className={styles.skeletonImage}></div>
                                <div className={styles.skeletonContent}>
                                    <div className={styles.skeletonTitle}></div>
                                    <div className={styles.skeletonText}></div>
                                    <div className={styles.skeletonText}></div>
                                    <div className={styles.skeletonText}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : news.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No news available for the selected category.</p>
                    </div>
                ) : (
                    <div className={styles.newsList}>
                        {news.map((newsItem, index) => (
                            <div
                                key={newsItem._id}
                                className={`${styles.newsRow} ${index % 2 === 0 ? styles.leftImage : styles.rightImage}`}
                            >
                                <div className={styles.imageContainer}>
                                    {newsItem.imageUrl ? (
                                        <img
                                            src={newsItem.imageUrl || "/placeholder.svg"}
                                            alt={newsItem.title}
                                            className={styles.newsImage}
                                        />
                                    ) : (
                                        <div className={styles.placeholderImage}>
                                            <span>No image</span>
                                        </div>
                                    )}
                                    {newsItem.category && (
                                        <span className={`${styles.badge} ${getCategoryClass(newsItem.category)}`}>
                                            {newsItem.category}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.contentContainer}>
                                    <h3 className={styles.newsTitle}>{newsItem.title}</h3>
                                    <div className={styles.newsMeta}>
                                        {newsItem.createdAt && (
                                            <span className={styles.newsDate}>Created on: {formatDate(newsItem.createdAt)}</span>
                                        )}
                                        {!newsItem.createdAt && newsItem.date && (
                                            <span className={styles.newsDate}>{formatDate(newsItem.date)}</span>
                                        )}
                                        {newsItem.author && (
                                            <div className={styles.newsAuthor}>By: {newsItem.author}</div>
                                        )}
                                    </div>
                                    <p className={styles.newsContent}>{newsItem.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewsDetail