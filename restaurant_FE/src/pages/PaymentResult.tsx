import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from '../css/PageCss/PaymentResult.module.css';
import { jwtDecode } from "jwt-decode";

function PaymentResult() {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get("vnp_TxnRef");
    const responseCode = searchParams.get("vnp_ResponseCode");
    const bookingId = Cookies.get("bookingId");
    const isSuccess = responseCode === "00";
    const navigate = useNavigate();
    const voucherId = Cookies.get("VoucherId");
    const totalAmount = Cookies.get("TotalAmount");
    const token = Cookies.get("token")

    useEffect(() => {
        if (transactionId && isSuccess) {
            fetch(`http://localhost:3000/payment/update-status/${transactionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => res.json())
                .then((data) => console.log("Order updated:", data))
                .catch((err) => console.error("Error updating order:", err));
        }
    }, [transactionId, isSuccess]);

    useEffect(() => {
        if (token) {
            const decodeToken: any = jwtDecode(token);

            fetch(`http://localhost:3000/cart/remove/all/${decodeToken.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            fetch(`http://localhost:3000/rank/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: decodeToken.id,
                    newSpending: Number(totalAmount)
                })
            });

            Cookies.remove('TotalAmount');
        }

        if (voucherId) {
            fetch(`http://localhost:3000/vouchers/status/${voucherId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => res.json())
                .then((data) => console.log("voucher updated:", data))
                .catch((err) => console.error("Error updating order:", err)
                );

            Cookies.remove('VoucherId');
        }
    }, [])

    const handleConfirmBooking = async () => {
        try {
            if (!bookingId) {
                alert("❌ Không tìm thấy bookingId trong cookie!");
                return;
            }

            console.log("📤 Gửi yêu cầu xác nhận booking:", bookingId);

            const response = await fetch(`http://localhost:3000/bookings/${bookingId}/confirm`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            console.log("✅ Phản hồi API:", data);

            // if (data.success) {
            //     alert(data.message || "✅ Đơn hàng đã được xác nhận!");
            // } else {
            //     alert("❌ Lỗi xác nhận đơn hàng!");
            // }

            navigate("/", { state: { bookingId, showReviewExperience: true } });
        } catch (error) {
            console.error("❌ Lỗi khi xác nhận booking!", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={isSuccess ? styles.successBox : styles.errorBox}>
                {isSuccess ? (
                    <>
                        <div className={styles.successIcon}>✔</div>
                        <h2 className={styles.title} style={{ color: '#28a745' }}>Success</h2>
                        <p className={styles.message}>Please pay the remaining amount at the restaurant.</p>
                        {/* <p className={styles.message}>Cảm ơn quý khách!</p> */}
                    </>
                ) : (
                    <>
                        <div className={styles.errorIcon}>✖</div>
                        <h2 className={styles.title} style={{ color: '#dc3545' }}>Failure</h2>
                        <p className={styles.message} style={{ marginBottom: '10px' }}>
                            Code: <strong>{responseCode}</strong>
                        </p>
                        <p className={styles.advice}>Please try again or contact support.</p>
                    </>
                )}
                <button onClick={handleConfirmBooking} className={styles.homeButton}>
                    Back to Home Page
                </button>
            </div>
        </div>
    )
}

export default PaymentResult