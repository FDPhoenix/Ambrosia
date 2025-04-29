import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Dùng để chuyển hướng trang
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icon mắt từ react-icons
import styles from '../CSS/PageCss/ForgotPassword.module.css'; // Đảm bảo bạn có file CSS này

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);  // Bước hiện tại: 1 - Nhập email, 2 - Nhập OTP, 3 - Nhập mật khẩu mới
  const [showPassword, setShowPassword] = useState(false);  // State để kiểm soát việc hiển thị mật khẩu
  const navigate = useNavigate();  // Hook dùng để chuyển hướng

  // Gửi yêu cầu quên mật khẩu (gửi OTP)
  const handleSubmitEmail = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/auth/forgot-password', { email });
      setMessage(response.data.message);
      if (response.data.success) {
        setStep(2);
      }
    } catch (error) {
      setMessage('Lỗi khi gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xác minh OTP
  const handleSubmitOtp = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/auth/verify-otp', { email, otp });
      setMessage(response.data.message);
      if (response.data.success) {
        setStep(3);
      }
    } catch (error) {
      setMessage('OTP không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật mật khẩu mới
  const handleSubmitPassword = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/auth/reset-password', { email, newPassword });
      setMessage(response.data.message);
      if (response.data.success) {
        alert('Password reset successfully');
        navigate('/login');
      }
    } catch (error) {
      setMessage('Lỗi khi thay đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      {step === 1 && (
        <form onSubmit={handleSubmitEmail} className={styles.forgotPasswordForm}>
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>

          <label>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Sending reset link...' : 'Send reset link'}
          </button>
          
          {message && <p className={styles.message}>{message}</p>}
          
          <div className={styles.backToLogin}>
            <a href="/login">Back to login</a>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitOtp}>
          <h2>Enter OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying OTP...' : 'Verify OTP'}
          </button>
          {message && <p>{message}</p>}
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmitPassword}>
          <h2>Set New Password</h2>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'} // Nếu showPassword là true, sẽ hiển thị mật khẩu
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)} // Toggle trạng thái hiển thị mật khẩu
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Thay đổi icon tùy thuộc vào trạng thái */}
            </span>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
