import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useApiCallHooks from '../../hooks/useApiCallHooks';
import SignUpForm from './form/SignUpForm';
import LoginForm from './form/LoginForm';
import GoogleLogin from './form/GoogleLogin'; // Import the new GoogleLogin component
import { FaCheckCircle } from 'react-icons/fa';
import { AuthModelApi } from './routes/ApiRoutes';
import { encryptData } from '../auth/utils/authUtils';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [response, loading, error, callAPI, statusCode] = useApiCallHooks();
  const [activeTab, setActiveTab] = useState('login');
  const [data, setData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ['', '', '', '', '', ''],
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showOtpInput, setShowOtpInput] = useState(false);

  useEffect(() => {
    if (statusCode === 201 && response?.statusText === 'Created') {
      setShowOtpInput(true);
    }
  }, [statusCode, response]);

  useEffect(() => {
    if (error && error.errors) {
      const filteredErrors = {};
      if (error.errors.email) filteredErrors.email = error.errors.email;
      if (error.errors.password) filteredErrors.password = error.errors.password;
      if (error.errors.otp) filteredErrors.otp = error.errors.otp;
      setFieldErrors(filteredErrors);
    }
  }, [error]);


  useEffect(() => {
    const storeEncryptedData = async () => {
      if (statusCode === 200 && response?.data?.message === 'LoggedIn') {
        try {
          const dataToEncrypt = {
            token: response.data.accessToken,
            userId: response.data.user.id,
            email: response.data.user.email,
            displayName: response.data.user.displayName,
          };
          const { encrypted, iv, key } = await encryptData(dataToEncrypt);
          if (!encrypted || !iv || !key) {
            throw new Error("Encryption failed: Missing values");
          }
          localStorage.setItem('authData', JSON.stringify({ encrypted, iv, key }));
          onLoginSuccess(response.data.user.email);
          toast.success(
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 w-6 h-6 mr-2" />
              <span>Login Successfully</span>
            </div>,
            {
              position: 'top-center',
              autoClose: 3000,
              hideProgressBar: true,
              closeButton: false,
              pauseOnHover: true,
              draggable: true,
              theme: 'dark',
              transition: Slide,
              style: {
                backgroundColor: '#111827',
                border: '1px solid #4b5563',
                transitionDuration: '0.8s',
              },
            }
          );
        } catch (err) {
          console.error('Encryption error:', err);
          toast.error(
            <div className="flex items-center">
              <span>Failed to encrypt auth data</span>
            </div>,
            {
              position: 'top-center',
              autoClose: 3000,
              hideProgressBar: true,
              closeButton: false,
              pauseOnHover: true,
              draggable: true,
              theme: 'dark',
              transition: Slide,
              style: {
                backgroundColor: '#111827',
                border: '1px solid #4b5563',
                transitionDuration: '0.8s',
              },
            }
          );
        }
      }
    };
    storeEncryptedData();
  }, [statusCode, response, onLoginSuccess]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!data.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Invalid email format';
    if (!data.password) errors.password = 'Password is required';
    if (activeTab === 'signup' && data.password !== data.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setFieldErrors({});
    if (!validateForm()) return;
    const signupData = {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };
    await callAPI('post', AuthModelApi.api.signup, signupData);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (!validateForm()) return;
    const loginData = {
      email: data.email,
      password: data.password,
    };
    await callAPI('post', AuthModelApi.api.login, loginData);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setData({ email: '', password: '', confirmPassword: '', otp: ['', '', '', '', '', ''] });
    setPasswordError('');
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowOtpInput(false);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = data.otp.join('');
    if (otpCode.length === 6) {
      await callAPI('post', AuthModelApi.api.verifyOtp, { email: data.email, otp: otpCode });
    } else {
      setFieldErrors({ otp: 'Please enter a 6-digit OTP' });
    }
  };

  const handleOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...data.otp];
      newOtp[index] = value;
      setData((prevData) => ({ ...prevData, otp: newOtp }));
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        closeButton={false}
        pauseOnHover
        draggable
        theme="dark"
        transition={Slide}
        style={{ transitionDuration: '0.8s' }}
      />
      <motion.div
        className="w-four max-w-sm bg-gray-900 rounded-xl border border-gray-800 shadow-lg p-4 pointer-events-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h2 className="text-white text-xl font-bold">Welcome to Clarity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <IoClose className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          {showOtpInput ? 'Enter the OTP sent to your email.' : 'Sign in to access all features and continue your conversation.'}
        </p>
        {!showOtpInput && (
          <div className="flex space-x-2 mb-4">
            <button
              className={`flex-1 py-2 rounded-lg font-bold ${activeTab === 'login' ? 'bg-black text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              onClick={() => handleTabChange('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-bold ${activeTab === 'signup' ? 'bg-black text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              onClick={() => handleTabChange('signup')}
            >
              Sign Up
            </button>
          </div>
        )}
        {activeTab === 'login' ? (
          <LoginForm
            {...{
              data,
              setData,
              fieldErrors,
              setFieldErrors,
              passwordError,
              setPasswordError,
              showPassword,
              togglePasswordVisibility,
              loading,
              handleLogin,
            }}
          />
        ) : (
          <SignUpForm
            {...{
              data,
              setData,
              fieldErrors,
              setFieldErrors,
              passwordError,
              setPasswordError,
              showPassword,
              showConfirmPassword,
              togglePasswordVisibility,
              toggleConfirmPasswordVisibility,
              loading,
              handleSignUp,
              showOtpInput,
              handleOtpSubmit,
              handleOtpChange,
              response,
            }}
          />
        )}
        {!showOtpInput && (
          <GoogleLogin onLoginSuccess={onLoginSuccess} />
        )}
        <p className="text-gray-500 text-xs text-center mt-2">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </>
  );
};

export default AuthModal;