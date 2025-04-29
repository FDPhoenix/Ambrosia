import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import styles from '../css/AddNote.module.css'; // Import CSS module mới
import Cookies from "js-cookie";

interface AddNoteProps {
    bookingId?: string;
    openReviewBookingModal: (bookingId: string) => void; // ✅ Thêm prop để mở modal ReviewBooking
}

const AddNote: React.FC<AddNoteProps> = ({ bookingId, openReviewBookingModal }) => {
    const [notes, setNotes] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        const effectiveBookingId = bookingId || Cookies.get("bookingId");

        if (!effectiveBookingId) {
            setErrorMessage("❌ Error: Booking ID not found!");
            console.error("❌ bookingId is missing in AddNote!");
            return;
        }

        try {
            await axios.put(`http://localhost:3000/bookings/${effectiveBookingId}/update-note`, { notes });
            console.log("📌 Note has been saved to the database.");

            console.log("🔄 Opening Review Booking Modal with ID:", effectiveBookingId); // DEBUG
            openReviewBookingModal(effectiveBookingId);  // ✅ Đảm bảo truyền đúng bookingId
        } catch (error) {
            console.error("❌ Error submitting note:", error);
            setErrorMessage("❌ Error submitting note. Please try again!");
        }
    };

    const handleSkip = () => {
        const effectiveBookingId = bookingId || Cookies.get("bookingId");

        if (!effectiveBookingId) {
            console.error("❌ Skip Error: Missing bookingId!");
            alert("❌ Error: Booking ID is missing!");
            return;
        }

        console.log("🔄 Skipping Add Note, opening ReviewBooking with ID:", effectiveBookingId);
        openReviewBookingModal(effectiveBookingId);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalHeader}>Add Note</h2>

                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter note for the order (optional)..."
                    className={styles.textarea}
                />

                <div className={styles.modalFooter}>
                    <button onClick={handleSubmit} className={styles.confirmButton}>Confirm</button>
                    <button onClick={handleSkip} className={styles.cancelButton}>Skip</button>
                </div>


            </div>
        </div>
    );
};

export default AddNote;
