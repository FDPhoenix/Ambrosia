import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import FormModal from '../pages/common/form-modal';
import styles from '../CSS/Register.module.css'
import { useNavigate } from 'react-router';
import { FaEye, FaEyeSlash } from "react-icons/fa";
const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    form: '', // Thêm lỗi chung cho form
  });

  const [otp, setOtp] = useState("");
  const [isOtpFormOpen, setIsOtpFormOpen] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const enterOtpForm = {
    title: "Enter The OTP",
    fields: [
      {
        value: otp,
        label: "OTP",
        name: "otp",
        type: "text",
        required: true,
        onChange: (e: { target: { value: React.SetStateAction<string>; }; }) => setOtp(e.target.value),
      },
    ],
    submitText: "Verify OTP",
  };

  const onVerifyOtp = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3000/auth/verify-otp`, {
        email: formData.email,
        otp,
      });
      if (response.data.success == true) {
        window.alert("OTP verified successfully! Go login now.");
        setIsOtpFormOpen(false);
        navigate('/login');
      } else {
        window.alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      window.alert("An unknown error occurred.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate Full Name (cho phép tối đa 2 dấu cách)
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
      isValid = false;
    } else if (formData.fullName.length > 50) {
      newErrors.fullName = 'Full Name must not exceed 50 characters';
      isValid = false;
    } else if (!/^[a-zA-ZÀ-ỹ]+( [a-zA-ZÀ-ỹ]+){0,2}$/.test(formData.fullName)) {
      newErrors.fullName = 'Full Name can only have up to 2 spaces and must not contain special characters.';
      isValid = false;
    } else {
      newErrors.fullName = '';
    }

    // Validate Email (không chứa khoảng trắng, không vượt quá 50 ký tự)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Valid email is required';
      isValid = false;
    } else if (formData.email.length > 50) {
      newErrors.email = 'Email must not exceed 50 characters';
      isValid = false;
    } else if (/\s/.test(formData.email)) {
      newErrors.email = 'Email must not contain spaces';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Validate Phone Number (chỉ chứa số, không có khoảng trắng)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone Number must contain only digits';
      isValid = false;
    } else if (formData.phoneNumber.length > 15) {
      newErrors.phoneNumber = 'Phone Number must not exceed 15 digits';
      isValid = false;
    } else {
      newErrors.phoneNumber = '';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    } else if (formData.password.length > 50) {
      newErrors.password = 'Password must not exceed 50 characters';
      isValid = false;
    } else if (/\s/.test(formData.password)) {
      newErrors.password = 'Password must not contain spaces';
      isValid = false;
    } else if (!/[A-Za-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one letter';
      isValid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
      isValid = false;
    } else {
      newErrors.password = '';
    }

    setErrors(newErrors);
    return isValid;

  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // Nếu form hợp lệ, gửi dữ liệu đến API
      try {
        const response = await axios.post('http://localhost:3000/auth/register', {
          fullname: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        });

        if (response.data.success) {
          setIsOtpFormOpen(true);
        } else {
          setErrors({ ...errors, form: response.data.message }); // Cập nhật lỗi từ API
        }
      } catch (error) {
        console.error('Error during registration:', error);
        setErrors({ ...errors, form: 'Registration failed. Please try again.' }); // Xử lý lỗi từ server
      }
    } else {
      console.log('Form has errors');
    }
  };

  const handleFormModalClose = () => {
    setIsOtpFormOpen(false);
  };

  return (
    <div className={styles.registerFormContainer}>
      <h2 className={styles.registerTitle}>Register</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            className={styles.inputField}
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <span className="error">{errors.fullName}</span>}
        </div>

        <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>

          <input
            type="email"
            className={styles.inputField}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            className={styles.inputField}
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
        </div>


        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles.inputField}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.showPasswordBtn}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <button type="submit" className={styles.submitBtn}>
          Register
        </button>

        {errors.form && <span className="error">{errors.form}</span>} {/* Hiển thị lỗi từ server */}
      </form>
      {isOtpFormOpen && (
        <FormModal
          handleClose={handleFormModalClose}
          open={isOtpFormOpen}
          formData={enterOtpForm}
          onSubmit={onVerifyOtp}
        />
      )}
    </div>
  );
};

export default Register;
