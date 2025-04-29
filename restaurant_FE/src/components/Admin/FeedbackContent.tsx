import React, { useEffect, useState } from "react";
import styles from "../../css/AdminCss/FeedbackContent.module.css";

interface Category {
  _id: string;
  name: string;
}

interface Feedback {
  _id: string;
  userId: {
    fullname: string;
    email: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  isHided: boolean;
  createdAt: string;
}

interface Dish {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: Category;
  isAvailable: boolean;
}

const BASE_IMAGE_URL = "http://localhost:3000/uploads/";

const FeedbackContent: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const [ratingFilter, setRatingFilter] = useState<number | "">("");

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, [selectedCategory]);

  const fetchDishes = () => {
    const apiUrl = selectedCategory
      ? `http://localhost:3000/api/feedback/allDishes?categoryId=${selectedCategory}`
      : `http://localhost:3000/api/feedback/allDishes`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setDishes(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Lỗi khi tải món ăn:", error));
  };

  const fetchCategories = () => {
    fetch("http://localhost:3000/category/all")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data.categories) ? data.categories : []))
      .catch((error) => console.error("Lỗi khi tải danh mục:", error));
  };

  const fetchFeedbacks = (dishId: string) => {
    setLoadingFeedback(true);
    fetch(`http://localhost:3000/api/feedback/dish/${dishId}`)
      .then((res) => res.json())
      .then((data) => setFeedbacks(data.feedbacks || []))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoadingFeedback(false));
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    fetchFeedbacks(dish._id);
    setRatingFilter("");
  };

  const toggleVisibility = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feedback/hide/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Lỗi khi cập nhật trạng thái feedback");

      const data = await response.json();

      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id ? { ...fb, isHided: data.feedback.isHided } : fb))
      );

      alert(
        data.feedback.isHided
          ? "Feedback đã được ẩn thành công!"
          : "Feedback đã được hiển thị lại!"
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Đã xảy ra lỗi khi cập nhật trạng thái feedback!");
    }
  };

  const filteredFeedbacks = ratingFilter
    ? feedbacks.filter((fb) => fb.rating === ratingFilter)
    : feedbacks;

  return (
    <div className={styles.container}>
      <select
        className={styles.select}
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">All Category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <div className={styles.grid}>
        {dishes.map((dish) => (
          <div
            key={dish._id}
            className={styles.card}
            onClick={() => handleDishClick(dish)}
          >
            <img
              src={
                dish.imageUrl
                  ? dish.imageUrl.startsWith("http")
                    ? dish.imageUrl
                    : `${BASE_IMAGE_URL}${dish.imageUrl}`
                  : "https://tse4.mm.bing.net/th?id=OIP.1QDPhOmFezmjXmeTYkbOagHaE8&pid=Api&P=0&h=180"
              }
              alt={dish.name}
              className={styles.image}
            />
            <div className={styles.info}>
              <h2 className={styles.dishName}>{dish.name}</h2>
              <p className={styles.price}>{dish.price.toLocaleString()} VND</p>
            </div>
          </div>
        ))}
      </div>

      {selectedDish && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedDish(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Feedback of {selectedDish.name}</h2>

            <div className={styles.filterContainer}>
              <label>Filter by Rating:</label>
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(e.target.value === "" ? "" : Number(e.target.value))
                }
              >
                <option value="">All</option>
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} star
                  </option>
                ))}
              </select>
            </div>

            {loadingFeedback ? (
              <p>Loading...</p>
            ) : filteredFeedbacks.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fullname</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((fb) => (
                    <tr key={fb._id} className={fb.isHided ? styles.hiddenRow : ""}>
                      <td>{fb.userId.fullname}</td>
                      <td>{fb.userId.email}</td>
                      <td>⭐ {fb.rating}</td>
                      <td>{fb.comment}</td>
                      <td>
                        {new Date(fb.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>{fb.isHided ? "Hidden" : "Showing"}</td>
                      <td>
                        <button
                          className={styles.pageButton}
                          onClick={() => toggleVisibility(fb._id)}
                        >
                          {fb.isHided ? "Show" : "Hide"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No feedback yet</p>
            )}

            <button className={styles.closeButton} onClick={() => setSelectedDish(null)}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackContent;