import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form } from "react-bootstrap";
import Modal from "react-modal";
import StatusBadge from "./StatusBadge";
import { FaInfoCircle } from 'react-icons/fa';
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from 'react-toastify';
import styles from '../../css/AdminCss/SystemReviewContent.module.css'

interface Review {
  id: string;
  _id?: string;
  userId?: {
    fullname: string;
    email: string;
    phoneNumber: string;
  };
  guestId?: {
    name: string;
    contactPhone: string;
    email: string;
  };
  rating: number;
  comment: string;
  isReplied: boolean;
}

function SystemReviewContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [replyModalOpen, setReplyModalOpen] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterIsReplied, setFilterIsReplied] = useState<string>("");
  const [filterRating, setFilterRating] = useState<string>("");

  const openModal = (review: Review) => {
    setSelectedReview(review);
    setModalIsOpen(true);
  };

  const openReplyModal = (review: Review & { _id?: string }) => {
    const reviewId = review.id || review._id || "";

    if (reviewId) {
      setSelectedReview({ ...review, id: reviewId });
      setReplyModalOpen(true);
    } else {
      console.error("⚠️ Review or reviewId is missing!", review);
      toast.error("Review data is missing!");
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setReplyModalOpen(false);
    setSelectedReview(null);
    setReplyContent("");
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:3000/reviews');
      const formattedReviews = response.data.reviews.map((review: { _id: unknown; }) => ({
        ...review,
        id: review._id,
      }));

      setReviews(formattedReviews);
      setLoading(false);
    } catch (err) {
      console.error("🚨 Failed to load reviews:", err);
      setError("Failed to load reviews.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return <span className={styles.stars}>{'⭐'.repeat(rating)}</span>;
  };

  const replyStars = (rating: number) => {
    return <span className={styles.replyStars}>{'⭐'.repeat(rating)}</span>;
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply content cannot be blank!");
      return;
    }

    if (!selectedReview?.id) {
      console.error("Review ID is missing!", selectedReview);
      toast.error("Review ID is missing!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/reviews/reply", {
        reviewId: selectedReview.id,
        replyContent,
      });

      if (response.data.message.toLowerCase().includes("email sent successfully")) {
        toast.success("Email was successfully delivered!");
      } else {
        toast.warning("Reply sent, but email might not have been sent.");
      }

      setReplyContent("");
      await fetchReviews();
    } catch (error) {
      console.error("Error occurred:", error);
      toast.error("Error sending reply!!");
    } finally {
      closeModal();
      setIsLoading(false);
    }
  };

  const fetchFiltersReviews = async () => {
    try {
      const queryParams = [];
      if (filterIsReplied !== "") queryParams.push(`isReplied=${filterIsReplied}`);
      if (filterRating !== "") queryParams.push(`rating=${filterRating}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      const response = await axios.get(`http://localhost:3000/reviews/filter${queryString}`);

      const formattedReviews = response.data.data.map((review: { _id: unknown }) => ({
        ...review,
        id: review._id,
      }));

      setReviews(formattedReviews);
      setLoading(false);
    } catch (err) {
      console.error("🚨 Failed to load reviews:", err);
      setError("Failed to load reviews.");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setIsLoading(true);
    fetchFiltersReviews();
    setIsLoading(false);
  };



  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className={styles.reviewContainer}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Sending feedback...</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: '5px' }}>Review Management</h2>

        <div className={styles.filterContainer}>
          <select
            className={styles.filterSelect}
            onChange={(e) => setFilterIsReplied(e.target.value)}
            value={filterIsReplied}
          >
            <option value="">All Status</option>
            <option value="true">Replied</option>
            <option value="false">No Replied</option>
          </select>

          <select
            className={styles.filterSelect}
            onChange={(e) => setFilterRating(e.target.value)}
            value={filterRating}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <button className={styles.filterButton} onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <table className={styles.reviewTable}>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Status</th>
              <th>Detail</th>
              <th>Reply</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    {review.userId ? review.userId.fullname : review.guestId ? review.guestId.name : "Unknown"}
                  </td>
                  <td>
                    <span>{renderStars(review.rating)}</span>
                  </td>
                  <td>{review.comment}</td>
                  <td>
                    <StatusBadge
                      status={review.isReplied}
                      caseTrue="Replied"
                      caseFalse="No Replied"
                    />
                  </td>
                  <td>
                    <Button variant="info" className={styles.ViewButton} onClick={() => openModal(review)}>
                      <FaInfoCircle className={styles.viewIcon} /> View Details
                    </Button>
                  </td>
                  <td>
                    <Button className={styles.replyButton} variant="primary" onClick={() => openReplyModal(review)}>
                      →
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ fontSize: "18px", textAlign: "center", padding: "20px", fontWeight: "bold", color: "#777" }}>
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modal trả lời phản hồi */}
        <Modal
          isOpen={replyModalOpen}
          onRequestClose={closeModal}
          className={styles.modal}
          overlayClassName={styles.overlay}
          shouldCloseOnOverlayClick={false}
          ariaHideApp={false}
        >
          {selectedReview && (
            <div className={styles.modalContent}>
              <h2 className={styles.modalHeader}>Reply to Feedback</h2>
              {/* <p>Review ID: {selectedReview.id}</p> */}
              <div className={styles.modalInfoContainer}>
                <div style={{ textAlign: 'center', marginTop: '2px', marginBottom: '10px' }}>
                  <span>
                    {replyStars(selectedReview.rating)}
                  </span>
                </div>
                <Form.Label className={styles.responseTitle}>User Reviews</Form.Label>
                <div className={styles.replyFeedback}>
                  <blockquote
                    className={styles.blockquote}
                    style={{
                      backgroundColor: '#f1f8ff',
                      padding: '15px',
                      borderLeft: '4px solid #007bff',
                      fontStyle: 'italic',
                      margin: '10px 0',
                    }}
                  >
                    "{selectedReview.comment || "No comment"}"
                  </blockquote>
                </div>
              </div>


              {/* Phần nhập phản hồi */}
              <Form.Group className="mt-3">
                <Form.Label className={styles.responseTitle}>Enter Feedback:</Form.Label>
                <Form.Control
                  as="textarea"
                  className={styles.textarea}
                  rows={3}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Enter your response..."
                />
              </Form.Group>

              <div className={styles.modalReplyButtons}>
                <Button className={styles.cancelReplyButton} variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button className={styles.sendReplyButton} variant="success" onClick={handleSendReply}>
                  Send
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal để hiển thị thông tin chi tiết */}
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className={styles.modal} overlayClassName={styles.overlay} shouldCloseOnOverlayClick={false} ariaHideApp={false}>
          {selectedReview && (
            <div className={styles.modalContent}>
              <h2 className={styles.modalHeader}>Customer Details</h2>
              <div className={styles.modalInfoContainer}>
                <div className={styles.modalInfoRow}>
                  <strong>Name:</strong><span>{selectedReview.userId ? selectedReview.userId.fullname : selectedReview.guestId?.name}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <strong>Phone:</strong> {selectedReview.userId ? selectedReview.userId.phoneNumber : selectedReview.guestId?.contactPhone}
                </div>
                <div className={styles.modalInfoRow}>
                  <strong>Email:</strong> {selectedReview.userId ? selectedReview.userId.email : selectedReview.guestId?.email}
                </div>
                <div className={styles.modalInfoRow}>
                  <strong>Rating:</strong> {replyStars(selectedReview.rating)}
                </div>
                <div className={styles.modalInfoRow}>
                  <strong>Comment:</strong> <span>{selectedReview.comment || "No comment"}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <strong>Status:</strong>
                  <span className={selectedReview.isReplied ? styles.replied : styles.notReplied}>
                    {selectedReview.isReplied ? "Replied" : "No Replied"}
                  </span>
                </div>
              </div>
              <div className={styles.modalButtons}>
                <button className={styles.closeButton} onClick={closeModal}>Close</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default SystemReviewContent