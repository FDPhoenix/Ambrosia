import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { FaStar } from "react-icons/fa";
import styles from "../css/ReviewExperience.module.css";

interface ReviewExperienceProps {
    bookingId: string;
    closeModal: () => void; // ✅ Nhận hàm đóng modal từ HomePage
}
const ReviewExperience: React.FC<ReviewExperienceProps> = ({ bookingId, closeModal }) => {
    // const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const [rating, setRating] = useState<number>(5);
    const [hover, setHover] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [isOpen, setIsOpen] = useState(true);

    const handleSubmit = async () => {
        try {
            await axios.post("http://localhost:3000/reviews/create", {
                bookingId,
                rating,
                comment,
            });
            alert("✅ Thank you for your review!");
            setIsOpen(false);
            closeModal();
            navigate("/");
        } catch (error) {
            console.error("❌ Error submitting review!", error);
            alert("❌ Review submission failed!");
        }
    };

    return (
        isOpen && (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <h2 className={styles.heading}>Rate Your Experience</h2>
                    {/* <p><strong>Booking ID:</strong> {bookingId}</p> */}

                    <div className={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                size={40}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(null)}
                                color={(hover || rating) >= star ? "#FFD700" : "#C0C0C0"}
                            />
                        ))}
                    </div>

                    <label className={styles.label}><strong>Comment:</strong></label>
                    <textarea
                        className={styles.textarea}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                    />

                    <div className={styles.buttonContainer}>
                        <button className={styles.submitButton} onClick={handleSubmit}>
                            Submit Review
                        </button>
                        <button
                            className={styles.skipButton}
                            onClick={() => {
                                closeModal();
                                navigate("/");
                            }}
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default ReviewExperience;
