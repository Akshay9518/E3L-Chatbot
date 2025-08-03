import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppBody from '../../components/AppBody';
import { FaPen, FaUserCircle, FaShieldAlt, FaQuestionCircle, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import { encryptData, decryptData, getDecryptedAuthData } from '../auth/utils/authUtils';
import useApiCallHooks from '../../hooks/useApiCallHooks';
import { SettingsApiRoutes } from './routes/ApiRoutes';
import { AuthModelApi } from '../auth/routes/ApiRoutes';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [response, loading, error, callAPI, statusCode] = useApiCallHooks();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [auth, setAuth] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('Update');
  const [dots, setDots] = useState('');
    const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (updateStatus === 'Updating') {
      interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [updateStatus]);

  useEffect(() => {
    const fetchAuthData = async () => {
      const authData = await getDecryptedAuthData();
      setAuth(authData);
      setDisplayName(authData?.displayName || 'User');
    };
    fetchAuthData();
  }, []);

  useEffect(() => {
    const updateLocalStorage = async () => {
      if (statusCode === 200 && response?.data?.message === 'Nameupdated') {
        try {
          const storedAuth = localStorage.getItem('authData');
          if (storedAuth) {
            const { encrypted, iv, key } = JSON.parse(storedAuth);
            const decryptedData = await decryptData({ encrypted, iv, key });
            const updatedData = {
              ...decryptedData,
              displayName: response.data.displayName,
            };
            const { encrypted: newEncrypted, iv: newIv, key: newKey } = await encryptData(updatedData);
            localStorage.setItem('authData', JSON.stringify({
              encrypted: newEncrypted,
              iv: newIv,
              key: newKey,
            }));
            setAuth(updatedData);
            setUpdateStatus('Updated');
            setTimeout(() => setUpdateStatus('Update'), 1500);
            setIsEditing(false);
          }
        } catch (err) {
          console.error('Error updating localStorage:', err);
          setUpdateStatus('Error');
          setTimeout(() => setUpdateStatus('Update'), 1500);
        }
      } else if (error) {
        setUpdateStatus('Error');
        setTimeout(() => setUpdateStatus('Update'), 1500);
      }
    };
    updateLocalStorage();
  }, [statusCode, response, error]);

  const handleUpdate = async () => {
    setUpdateStatus('Updating');
    setDots('.');
    const payload = {
      name: displayName,
      user_id: auth?.userId,
    };
    await callAPI('put', SettingsApiRoutes.api.update_profile, payload);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await callAPI('post', AuthModelApi.api.logout, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  useEffect(() => {
    if (response?.statusText === 'OK' && response?.data?.message === 'LoggedOut') {
      // clear storage + state
      localStorage.removeItem('authData');
      setAuth(null);

      // 1) navigate to home
      navigate('/', { replace: true });
    } else if (response && response?.statusText !== 'OK') {
      console.error('Logout failed:', response);
    }
  }, [response, navigate])


  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: {
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
      borderColor: 'white',
      transition: { duration: 0.2, ease: 'easeInOut' },
    },
    tap: { scale: 0.95 },
  };

  const logoutButtonVariants = {
    hover: {
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
      borderColor: '#f87171',
      transition: { duration: 0.2, ease: 'easeInOut' },
    },
    tap: { scale: 0.95 },
  };

  return (
    <AppBody
      content={
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="dark:bg-[#232323] rounded-2xl shadow-xl px-4 sm:px-8 py-4 w-full max-w-xl text-white"
          >
            <motion.div
              className="flex flex-col items-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.4 } }}
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-2xl font-bold border-2 border-gray-500 mb-4">
                {displayName ? displayName[0]?.toUpperCase() : 'U'}
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="border-b border-gray-500 text-white text-center bg-transparent focus:outline-none"
                          placeholder="Enter display name"
                        />
                        <button
                          onClick={handleUpdate}
                          disabled={updateStatus === 'Updating' || updateStatus === 'Updated'}
                          className={`rounded border border-gray-500 text-white px-4 py-1 text-sm transition-colors duration-200 cursor-pointer ${updateStatus === 'Updating' || updateStatus === 'Updated' ? 'opacity-50' : 'hover:bg-gray-600'
                            }`}
                        >
                          {updateStatus === 'Updating' ? `Updating${dots}` : updateStatus}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <h2 className="text-xl font-semibold">{displayName}</h2>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-white transition-colors duration-200 cursor-pointer hover:text-gray-300"
                        >
                          <FaPen className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-sm text-gray-400 mt-2">{auth?.email || 'No email available'}</p>
                {error?.errors?.name && (
                  <p className="text-sm text-red-400 mt-2">{error.errors.name}</p>
                )}
              </div>
            </motion.div>
            <motion.div
              className="flex justify-between mb-6 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }}
            >
              <div className="flex w-full">
                {[
                  { label: 'Chats', value: '4' },
                  { label: 'Roles', value: '4' },
                  { label: 'Rating', value: '89%' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex-1 text-center">
                    <p className="font-semibold">{value}</p>
                    <p className="text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl p-6 shadow-lg my-2"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="flex items-center gap-2 mb-4" variants={itemVariants}>
                <FaUserCircle className="h-6 w-6" />
                <h3 className="font-bold text-lg">Account Settings</h3>
              </motion.div>
              {[
                { label: 'Email Notifications' },
                { label: 'Dark Mode', defaultChecked: true },
                { label: 'Chat History', defaultChecked: true },
              ].map(({ label, defaultChecked }) => (
                <motion.div
                  key={label}
                  className="flex items-center justify-between mb-3"
                  variants={itemVariants}
                >
                  <span className="text-gray-600 dark:text-gray-300">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={defaultChecked}
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="flex flex-row flex-wrap justify-center gap-2 sm:gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4 } }}
            >
              {[
                { label: 'Security', icon: <FaShieldAlt className="h-5 w-5" /> },
                { label: 'Help', icon: <FaQuestionCircle className="h-5 w-5" /> },
                { label: 'About', icon: <FaInfoCircle className="h-5 w-5" /> },
                { label: 'Log Out', icon: <FaSignOutAlt className="h-5 w-5 text-red-400" /> },
              ].map(({ label, icon }) => (
                <motion.button
                  key={label}
                  variants={label === 'Log Out' ? logoutButtonVariants : buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={label === 'Log Out' ? handleLogout : undefined}
                  className={`flex items-center justify-center gap-2 p-2 sm:p-3 rounded-xl transition-colors duration-200 cursor-pointer text-white text-sm sm:text-base border ${label === 'Log Out'
                    ? 'bg-gray-50 dark:bg-[#1E1E1E] hover:bg-red-600 dark:hover:bg-red-600 border-transparent'
                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-[#1E1E1E] dark:hover:bg-[#252525] border-transparent'
                    } flex-1 sm:flex-none sm:min-w-[100px]`}
                >
                  {icon}
                  <span className={label === 'Log Out' ? 'text-red-400 font-bold' : ''}>{label}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      }
    />
  );
};

export default Settings;