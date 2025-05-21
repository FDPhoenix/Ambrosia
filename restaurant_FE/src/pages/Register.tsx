import React, { useState } from 'react';
import axios from 'axios';
import FormModal from '../pages/common/form-modal';
import { useNavigate } from 'react-router';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub, FaLinkedinIn } from "react-icons/fa";

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
    form: '',
  });

  const [otp, setOtp] = useState("");
  const [isOtpFormOpen, setIsOtpFormOpen] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
      try {
        setLoading(true);
        const response = await axios.post('http://localhost:3000/auth/register', {
          fullname: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
        });

        if (response.data.success) {
          setIsOtpFormOpen(true);
        } else {
          setErrors({ ...errors, form: response.data.message });
        }
      } catch (error) {
        console.error('Error during registration:', error);
        setErrors({ ...errors, form: 'Registration failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Form has errors');
    }
  };

  const handleFormModalClose = () => {
    setIsOtpFormOpen(false);
  };

  const handleLoginGoogle = () => {
    window.location.href = "http://localhost:3000/login/google";
  };

  const handleLoginFacebook = () => {
    window.location.href = "http://localhost:3000/facebook";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Left Panel - Registration Form */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Registration</h2>
          {errors.form && <p className="text-red-500 text-sm mb-4 text-center">{errors.form}</p>}
          
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-4">
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="w-full py-3 px-4 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a68a64]"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                disabled={loading}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            
            <div className="mb-4">
              <input
                type="email"
                id="email"
                name="email"
                className="w-full py-3 px-4 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a68a64]"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className="w-full py-3 px-4 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a68a64]"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                disabled={loading}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
            
            <div className="mb-5 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="w-full py-3 px-4 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a68a64]"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                disabled={loading}
              />
              <span
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3.5 px-4 bg-[#a68a64] text-white font-medium rounded-lg transition-all duration-300 hover:bg-[#8b7355] focus:outline-none focus:ring-2 focus:ring-[#a68a64] focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">or register with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
          
          <div className="flex justify-center gap-3">
            <button 
              type="button" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-[#db4437] transition-all duration-300 hover:bg-gray-200"
              onClick={handleLoginGoogle}
              disabled={loading}
            >
              <FaGoogle />
            </button>
            <button 
              type="button" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-[#1877f2] transition-all duration-300 hover:bg-gray-200"
              onClick={handleLoginFacebook}
              disabled={loading}
            >
              <FaFacebook />
            </button>
            <button 
              type="button" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all duration-300 hover:bg-gray-200"
              disabled={loading}
            >
              <FaGithub />
            </button>
            <button 
              type="button" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-[#0077b5] transition-all duration-300 hover:bg-gray-200"
              disabled={loading}
            >
              <FaLinkedinIn />
            </button>
          </div>
        </div>
        
        {/* Right Panel - Welcome Back Section */}
        <div className="w-1/2 p-8 flex flex-col justify-center items-center text-white text-center" style={{ backgroundColor: '#a68a64' }}>
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-sm mb-8 opacity-90">Already have an account?</p>
          <button 
            onClick={() => navigate('/login')}
            className="py-2.5 px-6 rounded-lg font-medium border-2 border-white transition-all duration-300 hover:bg-white hover:bg-opacity-10"
          >
            Login
          </button>
        </div>
      </div>
      
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