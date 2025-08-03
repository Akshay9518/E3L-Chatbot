import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBars, FaRegBuilding, FaRegUser, FaTimes } from 'react-icons/fa';
import { PiGraduationCapFill, PiUserFill, PiBuildingFill, PiUserBold } from "react-icons/pi";
import clsx from 'clsx';
import LoginHeader from './page/LoginHeader';
import { HiOutlineAcademicCap } from 'react-icons/hi';

const Header = ({ isMobile, toggleMobileSidebar, isSidebarOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const rawRole = location.state?.role || ''; // no default "Friend"

  // Capitalize each word if role exists
  const role = rawRole
    ? rawRole
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    : '';

  // Role config (icon + gradient)
  const roleConfig = {
    Friend: {
      icon: <PiUserBold className="text-black h-5 w-5" />, 
      gradient: "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400",
    },
    Mentor: {
      icon: <PiGraduationCapFill className="text-black h-5 w-5" />, 
      gradient: "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400",
    },
    "College Buddy": {
      icon: <PiBuildingFill className="text-black h-5 w-5" />,
      gradient: "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400",
    },
  };

  const { icon, gradient } = roleConfig[role] || {};

  return (
    <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between text-gray-700 h-14">
      <div className="flex justify-between items-center w-full">
        {/* Left Side: Role Name and Mobile Sidebar Toggle */}
        <div className="flex items-center space-x-2">
          {/* Mobile Sidebar Toggle */}
          {isMobile && (
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded hover:bg-opacity-10 text-gray-700 hover:bg-gray-100"
            >
              {isSidebarOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          )}

          {/* Role Badge (only show if role exists) */}
          {role && (
            <span
              className={clsx(
                gradient,
                'flex items-center gap-2 text-black px-3 py-2 mt-2 rounded-xl text-sm sm:text-base font-semibold shadow-md transition'
              )}
            >
              {icon}
              {role}
            </span>
          )}
        </div>

        {/* Right Side: Login Button */}
        <LoginHeader />
      </div>
    </nav>
  );
};

export default Header;
