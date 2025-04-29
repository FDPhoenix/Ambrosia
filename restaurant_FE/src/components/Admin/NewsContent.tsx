import { useState, useEffect } from "react"
import styles from "../../css/AdminCss/NewsContent.module.css"
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

interface NewsItem {
    _id: string
    title: string
    content: string
    category: string
    author: string
    imageUrl: string
    isPublished: boolean
}

function NewsContent() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("Promotion")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isPublished, setIsPublished] = useState(false)
    const [filterCategory, setFilterCategory] = useState("");

    useEffect(() => {
        fetchNews();
    }, [filterCategory]);

    const fetchNews = async () => {
        try {
            let url = "http://localhost:3000/news/all";
            if (filterCategory) {
                url += `?category=${filterCategory}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            setNews(data.news);
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    };

    const handleDeleteNews = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/news/${id}`, { method: "DELETE" })
            fetchNews()
        } catch (error) {
            console.error("Error deleting news:", error)
        }
    }

    const openAddModal = () => {
        setEditingNews(null)
        setTitle("")
        setContent("")
        setCategory("Promotion")
        setImageFile(null)
        setIsPublished(false)
        setModalOpen(true)
    }

    const openEditModal = (item: NewsItem) => {
        setEditingNews(item)
        setTitle(item.title)
        setContent(item.content)
        setCategory(item.category)
        setImageFile(null)
        setIsPublished(item.isPublished)
        setModalOpen(true)
    }

    const handleSubmit = async () => {
        const method = editingNews ? "PUT" : "POST"
        const url = editingNews ? `http://localhost:3000/news/${editingNews._id}` : "http://localhost:3000/news"

        try {
            const formData = new FormData()
            formData.append("title", title)
            formData.append("content", content)
            formData.append("category", category)
            formData.append("isPublished", String(isPublished))
            if (imageFile) {
                formData.append("image", imageFile)
            }

            const response = await fetch(url, {
                method,
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Failed to ${editingNews ? "update" : "add"} news`)
            }

            fetchNews()
            setModalOpen(false)
        } catch (error) {
            console.error("Error saving news:", error)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>List of News</h3>
                <div className={styles.selectHeader}>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Categories</option>
                        <option value="Promotion">Promotion</option>
                        <option value="New Dish">New Dish</option>
                        <option value="Event">Event</option>
                        <option value="Restaurant News">Restaurant News</option>
                    </select>
                    <button onClick={openAddModal} className={styles.addButton}>
                        Add new
                    </button>
                </div>
            </div>

            <table className={styles.newsTable}>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {news.map((item) => (
                        <tr key={item._id}>
                            <td>
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl || "/placeholder.svg"}
                                        alt={item.title}
                                        className={styles.newsImage}
                                    />
                                ) : (
                                    "No Image"
                                )}
                            </td>
                            <td style={{fontSize: '16px'}}>{item.title}</td>
                            <td style={{fontSize: '16px'}}>{item.category}</td>
                            <td style={{fontSize: '16px'}}>{item.author || "Admin"}</td>
                            <td>
                                <StatusBadge status={item.isPublished} caseTrue={"Available"} caseFalse={"Unavailable"}/>
                            </td>
                            <td className={styles.actions}>
                                <button
                                    onClick={() => openEditModal(item)}
                                    className={styles.editButton}
                                    title="Edit"
                                    style={{fontSize: '18px'}}
                                >
                                    <FaEdit />
                                </button>


                                <button
                                    onClick={() => handleDeleteNews(item._id)}
                                    className={styles.deleteButton}
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingNews ? "Edit News" : "Add News"}</h3>
                        <input
                            type="text"
                            placeholder="Updated News Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Updated Content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Promotion">Promotion</option>
                            <option value="New Dish">New Dish</option>
                            <option value="Event">Event</option>
                            <option value="Restaurant News">Restaurant News</option>
                        </select>
                        <div className={styles.fileInputWrapper}>
                            <label className={styles.fileInputLabel}>
                                <span>Choose Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={styles.fileInput}
                                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </label>
                            <span className={styles.fileName}>
                                {imageFile ? imageFile.name : "No file chosen"}
                            </span>
                        </div>
                        <div className={styles.checkboxWrapper}>
                            <input
                                type="checkbox"
                                id="isPublished"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                            />
                            <label htmlFor="isPublished">Published</label>
                        </div>
                        <div className={styles.modalButtons}>
                            <button onClick={handleSubmit} className={styles.submitButton}>
                                {editingNews ? "Update" : "Add"}
                            </button>
                            <button
                                onClick={() => setModalOpen(false)}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NewsContent