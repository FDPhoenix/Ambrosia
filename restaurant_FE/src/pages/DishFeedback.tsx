import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import styles from "../css/feedback.module.css";
import "font-awesome/css/font-awesome.min.css";
import Cookies from "js-cookie";

interface Feedback {
  _id: string;
  userId: {
    _id: string;
    email: string;
    fullname: string;
    profileImage: string;
  };
  dish_id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const DishFeedback: React.FC = () => {
  const { dishId } = useParams<{ dishId: string }>();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [newRating, setNewRating] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const getToken = () => Cookies.get("token");

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(decodedToken.id);
    }

    if (dishId) {
      axios
        .get(`http://localhost:3000/api/feedback/dish/${dishId}`)
        .then((response) => {
          setFeedbacks(response.data.feedbacks);
          setLoading(false);
        })
        .catch(() => {
          setError("Chưa có feedback!!!");
          setLoading(false);
        });
    }
  }, [dishId]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleDelete = (id: string) => {
    const token = getToken();
    if (!token) {
      showNotification("Bạn cần đăng nhập để xóa feedback.");
      return;
    }

    axios
      .delete(`http://localhost:3000/api/feedback/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id));
        showNotification("Feedback đã được xóa.");
      })
      .catch(() => {
        showNotification("Có lỗi xảy ra khi xóa feedback.");
      });
  };

  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setNewComment(feedback.comment);
    setNewRating(feedback.rating);
  };

  const handleSaveEdit = (id: string) => {
    const token = getToken();
    if (!token) {
      showNotification("Bạn cần đăng nhập để chỉnh sửa feedback.");
      return;
    }

    axios
      .put(
        `http://localhost:3000/api/feedback/update/${id}`,
        { rating: newRating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setFeedbacks(
          feedbacks.map((feedback) =>
            feedback._id === id ? response.data.feedback : feedback
          )
        );
        setEditingFeedback(null);

        showNotification("Feedback đã được cập nhật.");
      })
      .catch(() => {
        showNotification("Có lỗi xảy ra khi cập nhật feedback.");
      });
  };

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={index < rating ? "fa fa-star" : "fa fa-star-o"}
      />
    ));

  const handleStarClick = (rating: number) => {
    setNewRating(rating);
  };

  const renderEditableStars = (selectedRating: number) =>
    [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={index < selectedRating ? "fa fa-star" : "fa fa-star-o"}
        onClick={() => handleStarClick(index + 1)}
        style={{
          cursor: "pointer",
          fontSize: "24px",
          color: index < selectedRating ? "#ffcc00" : "#ccc",
        }}
      />
    ));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.feedbackContainer}>
      <h2>Feedbacks cho món ăn</h2>
      {notification && <div className={styles.notification}>{notification}</div>}
      {loading ? (
        <p>Đang tải feedback...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className={styles.feedbackItem}>
              <div>
                <div className={styles.userInfo}>
                  <img
                    src={
                      feedback.userId.profileImage ||
                      "https://via.placeholder.com/50"
                    }
                    alt="Avatar"
                    className={styles.userAvatar}
                  />
                  <div className={styles.userNameRating}>
                    <span className={styles.userName}>
                      {feedback.userId.fullname}
                    </span>
                    <div className={styles.rating}>{renderStars(feedback.rating)}</div>
                    <span className={styles.feedbackTime}>
                      {new Date(feedback.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {editingFeedback?._id === feedback._id ? (
                  <div>
                    <div className={styles.ratingEdit}>
                      {renderEditableStars(newRating)}
                    </div>
                    <div className={styles.editingContainer}>
                      <textarea
                        className={styles.text}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        className={styles.saveEdit}
                        onClick={() => handleSaveEdit(feedback._id)}
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>
                      <strong>Comment:</strong> {feedback.comment}
                    </p>

                    {currentUser === feedback.userId._id && (
                      <div className={styles.optionsContainer}>
                        <span
                          className={styles.optionsMenu}
                          onClick={() =>
                            setShowMenu(
                              showMenu === feedback._id ? null : feedback._id
                            )
                          }
                        >
                          &#8942;
                        </span>
                        {showMenu === feedback._id && (
                          <div ref={menuRef} className={styles.optionsDropdown}>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => handleEdit(feedback)}
                            >
                              Edit
                            </button>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => handleDelete(feedback._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DishFeedback;
