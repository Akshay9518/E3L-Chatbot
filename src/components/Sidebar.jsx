import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaChevronDown,
  FaChevronUp,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaHistory,
  FaEllipsisV,
  FaShare,
  FaTrash,
} from 'react-icons/fa';
import clsx from 'clsx';
import { MenuItems } from './page/MenuItems';
import useApiCallHooks from '../hooks/useApiCallHooks';

const Sidebar = ({ isOpen, isMobile, onClose, isCollapsed, toggleCollapse, isDarkMode }) => {
  const [response, loading, error, callAPI] = useApiCallHooks();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const toggleSubmenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    callAPI('get', '/api/history');
  }, [callAPI]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sidebarClass = clsx(
    'fixed top-0 left-0 h-full z-40 transition-all duration-300',
    'border-r border-[#313131]',
    isMobile ? (isOpen ? 'w-55 bg-black' : 'w-0 overflow-hidden') : isCollapsed ? 'w-15' : 'w-55'
  );

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-30 backdrop-blur-sm " onClick={onClose} />
      )}
      <div
        className={sidebarClass}
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      >
        {/* Collapse Toggle */}
        <div
          className={clsx(
            'flex items-center p-2 h-16',
            isCollapsed ? 'justify-center' : 'justify-end',
            isDarkMode ? 'border-gray-700' : 'border-gray-300'
          )}
        >
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className={clsx(
                'p-2 rounded transition-transform duration-200',
                'text-white hover:bg-gray-700 hover:bg-white hover:text-black cursor-pointer'
              )}
            >
              {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
            </button>
          )}
        </div>

        {/* Menu */}
        <div className="h-[calc(100%-64px)]">
          <ul className="mt-4 space-y-2 px-1">
            {/* Top MenuItems */}
            {MenuItems.slice(0, 3).map((item, index) => {
              const hasChildren = item.children?.length > 0;
              const isActive = location.pathname === item.path;
              const isChildActive =
                hasChildren &&
                item.children.some((child) => location.pathname === child.path);
              const isOpenSub = openMenu === item.name || isChildActive;

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (hasChildren) toggleSubmenu(item.name);
                      else if (isMobile) onClose();
                    }}
                    className={clsx(
                      'w-full flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-300 cursor-pointer',
                      isActive || isChildActive
                        ? 'bg-gray-200 dark:bg-[#313131]'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#313131]'
                    )}
                  >
                    <div
                      className={clsx(
                        'flex items-center',
                        isCollapsed ? 'justify-center w-full' : ''
                      )}
                    >
                      <span
                        className={clsx(
                          'text-lg',
                          isActive || isChildActive
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-300'
                        )}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-sm ml-2 font-semibold truncate">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && hasChildren && (
                      <span
                        className={clsx(
                          'transition-transform duration-300',
                          isOpenSub ? 'rotate-180' : '',
                          isActive || isChildActive
                            ? 'text-black'
                            : 'text-gray-400 dark:text-gray-300'
                        )}
                      >
                        {isOpenSub ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    )}
                  </Link>

                  {/* Submenu */}
                  {!isCollapsed && hasChildren && (
                    <ul
                      className={clsx(
                        'transition-all duration-300 overflow-hidden',
                        isOpenSub ? 'max-h-screen' : 'max-h-0'
                      )}
                    >
                      {item.children.map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              onClick={() => isMobile && onClose()}
                              className={clsx(
                                'flex items-center px-6 py-2 text-sm rounded-md transition-all duration-200 cursor-pointer border-l-2',
                                isSubActive
                                  ? 'bg-blue-800 text-white dark:bg-blue-700 border-blue-600 dark:border-blue-500'
                                  : 'text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-500 border-transparent hover:bg-gray-100 dark:hover:bg-[#313131] hover:scale-[1.02]'
                              )}
                            >
                              <span className="mr-2 text-base">
                                {subItem.icon || (
                                  <span className="inline-block w-4" />
                                )}
                              </span>
                              <span className="font-normal">{subItem.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}

            {/* History Section */}
            <li>
              <div
                className="w-full flex items-center justify-between px-4 py-2 my-2 border-b-[0.5px] border-gray-700"
              >
                <div
                  className={clsx(
                    'flex items-center',
                    isCollapsed ? 'justify-center w-full' : ''
                  )}
                >
                  <span className="text-lg text-gray-600 dark:text-gray-300">
                    <FaHistory />
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm ml-2 font-semibold">Chats</span>
                  )}
                </div>
              </div>

              {/* Sessions List */}
              {!isCollapsed && (
                <ul
                  className="transition-all duration-300 overflow-y-auto"
                  style={{
                    maxHeight: 'calc(100vh - 64px - 144px - 40px )',
                    scrollbarWidth: 'thin',
                  }}
                >
                  {response?.data?.sessions?.length > 0 ? (
                    response.data.sessions.map((session, index) => {
                      const isActiveSession =
                        location.pathname === `/chat/${session.sessionId}`;

                      return (
                        <li key={index} className="relative">
                          {/* Entire div clickable highlight */}
                          <div
                            className={clsx(
                              'group flex items-center justify-between mx-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200',
                              isActiveSession
                                ? 'bg-gray-300 dark:bg-[#444]'
                                : 'hover:bg-gray-200 dark:hover:bg-[#313131]'
                            )}
                            onTouchStart={() => {
                              // Start timer for long press
                              const timer = setTimeout(() => {
                                setOpenDropdown(session.sessionId);
                              }, 600); // 600ms = long press threshold
                              Timer = timer;
                            }}
                            onTouchEnd={() => {
                              clearTimeout(Timer);
                            }}
                          >
                            {/* Chat Link */}
                            <Link
                              to={`/chat/${session.sessionId}`}
                              state={{
                                sessionId: session.sessionId,
                                role: session.role || 'friend',
                                initialMessage: '',
                                messages: session.messages || [],
                              }}
                              onClick={() => isMobile && onClose()}
                              className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300"
                            >
                              {session.title}
                            </Link>

                            {/* Three-dot button (desktop hover only) */}
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === session.sessionId ? null : session.sessionId
                                )
                              }
                              className={clsx(
                                'ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                                openDropdown === session.sessionId
                                  ? 'bg-gray-300 dark:bg-gray-600 opacity-100'
                                  : 'hover:bg-gray-300 dark:hover:bg-gray-600'
                              )}
                            >
                              <FaEllipsisV
                                className={clsx(
                                  'text-gray-500 cursor-pointer',
                                  openDropdown === session.sessionId && 'text-black dark:text-white'
                                )}
                              />
                            </button>
                          </div>

                          {/* Dropdown remains same */}
                          {openDropdown === session.sessionId && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-4 p-2 top-10 w-32 bg-white dark:bg-[#313131] rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-100"
                            >
                              <button
                                className="flex gap-2 items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg cursor-pointer"
                                onClick={() => {
                                  console.log('Share:', session.sessionId);
                                  setOpenDropdown(null);
                                }}
                              >
                                <FaShare /> Share
                              </button>
                              <button
                                className="flex gap-2 items-center w-full text-red-500 text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg cursor-pointer"
                                onClick={() => {
                                  console.log('Delete:', session.sessionId);
                                  setOpenDropdown(null);
                                }}
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          )}
                        </li>

                      );
                    })
                  ) : (
                    <li className="px-6 py-2 text-sm text-gray-400">
                      No Chats found
                    </li>
                  )}
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
