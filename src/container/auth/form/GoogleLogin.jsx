import React from 'react';
import { FcGoogle } from 'react-icons/fc';


import { toast, Slide } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import useApiCallHooks from '../../../hooks/useApiCallHooks';
import { AuthModelApi } from '../routes/ApiRoutes';
import { GOOGLE_CLIENT_ID } from '../../../url/config';
import { encryptData } from '../utils/authUtils';

const GoogleLogin = ({ onLoginSuccess }) => {
  const [response, loading, error, callAPI, statusCode] = useApiCallHooks();
  const handleGoogleSignIn = async () => {
    try {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      // Prompt Google Sign-In
      window.google.accounts.id.prompt();
    } catch (err) {
      console.error('Google Sign-In initialization failed:', err);
      toast.error(
        <div className="flex items-center">
          <span>Failed to initialize Google Sign-In</span>
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
  };

  const handleCredentialResponse = async (response) => {
    try {
      // Send Google ID token to backend
        await callAPI('post', AuthModelApi.api.googleSignIn, {
          idToken: response.credential,
        });

      if (statusCode === 200 && response?.data?.message === 'LoggedIn') {
        const dataToEncrypt = {
          token: response.data.accessToken,
          userId: response.data.user.id,
          email: response.data.user.email,
          displayName: response.data.user.displayName,
        };

        const { encrypted, iv, key } = await encryptData(dataToEncrypt);
        localStorage.setItem('authData', JSON.stringify({ encrypted, iv, key }));

        onLoginSuccess(response.data.user.email);

        toast.success(
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 w-6 h-6 mr-2" />
            <span>Google Sign-In Successful</span>
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
    } catch (err) {
      console.error('Google Sign-In error:', err);
      toast.error(
        <div className="flex items-center">
          <span>Google Sign-In Failed</span>
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
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center hover:bg-gray-600 transition mt-2 ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label="Continue with Google"
    >
      <FcGoogle className="w-5 h-5 mr-2" />
      Continue with Google
    </button>
  );
};

export default GoogleLogin;