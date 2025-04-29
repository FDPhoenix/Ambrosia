import React, { useState, useEffect } from 'react';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import FormModal from '../pages/common/form-modal';
import axios from 'axios';
import styles from '../CSS/Login.module.css';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const getCookie = (name: string) => {
  const cookieArr = document.cookie.split("; ");
  for (const cookie of cookieArr) {
    const [key, value] = cookie.split("=");
    if (key === name) return decodeURIComponent(value);
  }
  return null;
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpFormOpen, setIsOtpFormOpen] = useState(false);
  const token = getCookie("token");

  useEffect(() => {
    if (token) {
      document.cookie = `token=${token}; path=/;`;
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

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
        email,
        otp,
      });
      if (response.data.success == true) {
        window.alert("OTP verified successfully! Go login now.");
        setIsOtpFormOpen(false);
      } else {
        window.alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      window.alert("An unknown error occurred.");
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLoginGoogle = () => {
    window.location.href = "http://localhost:3000/login/google";
  };

  const handleLoginFacebook = () => {
    window.location.href = "http://localhost:3000/facebook";
  };

  const validateInputs = () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return false;
    }

    if (email.length < 6 || email.length > 50 || email.includes(" ") || !/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format or length (6-50 characters, no spaces).');
      return false;
    }

    if (
      password.length < 6 ||
      password.length > 50 ||
      password.includes(" ") ||
      !/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)
    ) {
      setError('Password must be 6-50 characters, no spaces, and include letters, numbers, and special characters.');
      return false;
    }

    return true;
  };

  const handleFormModalClose = () => {
    setIsOtpFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch((jsonError) => {
        console.error('Invalid JSON response:', jsonError);
        throw new Error('Invalid response from server.');
      });

      if (response.status === 403) {
        setIsOtpFormOpen(true);
        return;
      }

      if (!response.ok) {
        console.error('API Error:', response.status, data.message);
        setError(data.message || `Error: ${response.statusText}`);
        return;
      }

      Cookies.set('token', data.token, { expires: 7, path: '/' });

      const decodedToken: any = jwtDecode(data.token);
      
      alert('Login successful!');

      if (decodedToken.roleId == '67ac64afe072694cafa16e76') {
        navigate('/manage/dashboard')
      } else {
        navigate('/');
      }
    } catch (err) {
      console.log('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit} autoComplete="off">
        <h2>Login</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="off"
            disabled={loading}
          />
        </div>
        <div className={`${styles.formGroup} ${styles.passwordGroup}`}>
          <label htmlFor="password">Password:</label>
          <div className={styles.passwordInputIontainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="off"
              disabled={loading}
            />
            <span
              className={styles.passwordToggleIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className={styles.divider}>
          <span>Or login with</span>
        </div>
        <div className={styles.socialButtons}>
          <button type="button" className={`${styles.socialButton} ${styles.google}`} disabled={loading}
            onClick={() => handleLoginGoogle()}
          >
            <FaGoogle className="icon" /> Google
          </button>
          
          <button
            type="button"
            className={`${styles.socialButton} ${styles.facebook}`}
            disabled={loading}
            onClick={handleLoginFacebook}
          >
            <FaFacebook className="icon" /> Facebook
          </button>
        </div>
        <p className={styles.registerLink}>
          Don't have an account? <a href="/register">Register here</a>
        </p>

        {/* Forgot Password link */}
        <p className={styles.forgotPasswordLink}>
          <a href="#" onClick={() => navigate('/forgot-password')}>Forgot Password?</a>
        </p>
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

export default Login;
