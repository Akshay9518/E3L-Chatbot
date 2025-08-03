import React, { useState, useEffect, useRef } from 'react';
import { FiLogIn, FiSettings, FiLogOut } from 'react-icons/fi';
import { getDecryptedAuthData } from '../../container/auth/utils/authUtils';
import AuthModal from '../../container/auth/AuthModel';
import { SettingsUiRoutes } from '../../container/settings/routes/UiRoutes';
import useApiCallHooks from '../../hooks/useApiCallHooks';
import { AuthModelApi } from '../../container/auth/routes/ApiRoutes';
import { useNavigate } from 'react-router-dom';

const LoginHeader = ({ onAuthChange }) => {
    const [response, loading, error, callAPI, statusCode] = useApiCallHooks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        const fetchAuthData = async () => {
            const { email, displayName } = await getDecryptedAuthData();
            setAuth({ email, displayName });
            setIsLoading(false);
        };
        fetchAuthData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (response?.statusText === 'OK' && response?.data?.message === 'LoggedOut') {
            // clear storage + state
            localStorage.removeItem('authData');
            setAuth(null);
            setIsDropdownOpen(false);

            // 1) navigate to home
            navigate('/', { replace: true });
            // 2) then reload
            window.location.reload();
        } else if (response && response?.statusText !== 'OK') {
            console.error('Logout failed:', response);
        }
    }, [response, navigate])

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await callAPI('post', AuthModelApi.api.logout, {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (isLoading) return null;

    return (
        <div className="flex flex-col items-center z-20">
            {auth?.email ? (
                <div ref={dropdownRef} className="relative">
                    <div
                        className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black font-bold text-lg cursor-pointer sm:w-10 sm:h-10 sm:text-xl border-2 border-gray-300"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {auth.email.slice(0, 2).toUpperCase()}
                    </div>
                    {isDropdownOpen && (
                        <div className="absolute top-12 right-3 mt-2 w-56 sm:w-64 dark:bg-[#232323] rounded-lg shadow-lg z-50 overflow-hidden">
                            <div className="flex items-center px-2 py-1 sm:px-4 sm:py-3 border-b border-gray-600">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 border-2 border-gray-300">
                                    {auth.displayName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex flex-col max-w-[180px] sm:max-w-[200px]">
                                    <span
                                        className="text-white font-bold text-sm sm:text-base overflow-hidden text-ellipsis whitespace-nowrap"
                                        title={auth.displayName} // Tooltip for full text on hover
                                    >
                                        {auth.displayName}
                                    </span>
                                    <span
                                        className="text-gray-300 text-xs sm:text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                                        title={auth.email} // Tooltip for full text on hover
                                    >
                                        {auth.email}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={SettingsUiRoutes.url.setting}
                                className="flex items-center px-4 py-2 text-white font-bold text-sm sm:text-base hover:bg-gray-600"
                            >
                                <FiSettings className="mr-2 text-lg sm:text-xl" />
                                Settings
                            </a>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center px-4 py-2 dark:text-red-400 font-bold text-sm sm:text-base hover:bg-gray-600 cursor-pointer"
                            >
                                <FiLogOut className="mr-2 text-lg sm:text-xl" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 flex items-center justify-center text-sm sm:text-base"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FiLogIn className="mr-2 text-lg sm:text-xl" />
                    Login
                </button>
            )}
            <div className="fixed bottom-4 right-4 z-50">
                <AuthModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onLoginSuccess={onAuthChange}
                />
            </div>
        </div>
    );
};

export default LoginHeader;