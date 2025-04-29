import { useState } from "react";
import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { setBookingInfo } from "../redux/bookingSlice"; // Lưu vào Redux
import styles from "../css/BookingForm.module.css";

const BookingForm = ({ openSelectDateTimeModal, closeModal }: {
    openSelectDateTimeModal: () => void;
    closeModal: () => void;
}) => {
    const dispatch = useDispatch();
    // const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [errors, setErrors] = useState({ name: "", phone: "", email: "" });

    // Kiểm tra tên hợp lệ
    const validateName = (name: string) => {
        const regex = /^(?!\s)(?!.*\s{3,})[A-Za-zÀ-Ỹà-ỹ\s]+(?<!\s)$/;
        if (!regex.test(name) || /^\d/.test(name)) {
            return "Name must not contain special characters, start with a number, or have more than two consecutive spaces.";
        }
        return "";
    };

    // Kiểm tra số điện thoại hợp lệ (chỉ cho phép số, đủ 10 hoặc 11 chữ số)
    const validatePhone = (phone: string) => {
        const regex = /^(\d{10,11})$/;
        if (!regex.test(phone)) {
            return "Phone number must be 10 or 11 digits and contain only numbers.";
        }
        return "";
    };

    // Kiểm tra email hợp lệ
    const validateEmail = (email: string) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(email)) {
            return "Invalid email format.";
        }
        return "";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        let errorMsg = "";
        if (name === "name") errorMsg = validateName(value);
        if (name === "phone") errorMsg = validatePhone(value);
        if (name === "email") errorMsg = validateEmail(value);

        setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const nameError = validateName(form.name);
        const phoneError = validatePhone(form.phone);
        const emailError = validateEmail(form.email);

        if (nameError || phoneError || emailError) {
            setErrors({ name: nameError, phone: phoneError, email: emailError });
            return;
        }

        // Lưu thông tin vào Redux
        dispatch(setBookingInfo(form));
        // Mở modal SelectDateTime
        openSelectDateTimeModal();

        // Chuyển tới trang chọn ngày và giờ
        // navigate("/select-date-time");
    };

    return (
        <div>
            <div className={styles.bookingFormOverlay}>
                <div className={styles.bookingFormContent}>
                    <button className={styles.closeButton} onClick={closeModal}>
                        ✖
                    </button>
                    <h2 className={styles.bookingFormHeader}>Table Reservation Information</h2>
                    <form onSubmit={handleSubmit} className={styles.bookingForm}>
                        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className={styles.bookingFormInput} />
                        {errors.name && <p className={styles.errorText}>{errors.name}</p>}

                        <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required className={styles.bookingFormInput} />
                        {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}

                        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className={styles.bookingFormInput} />
                        {errors.email && <p className={styles.errorText}>{errors.email}</p>}

                        <button type="submit" className={styles.bookingFormSubmitButton}>
                            Next
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingForm;
