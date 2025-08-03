import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Header from './Header';
import Sidebar from './Sidebar';

const AppBody = ({ content }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      elem.requestFullscreen?.() ||
        elem.webkitRequestFullscreen?.() ||
        elem.mozRequestFullScreen?.() ||
        elem.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.mozCancelFullScreen?.() ||
        document.msExitFullscreen?.();
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background with gradient and animation */}
      
      <div
        className={clsx(
          'flex min-h-screen duration-300 text-white',
          'relative z-10'
        )}
      >
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobile={isMobile}
          isOpen={isMobile ? mobileSidebarOpen : true}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <div
          className={clsx(
            'flex-1 flex flex-col transition-all duration-300 relative z-20',
            isMobile
              ? '' // No margin on mobile
              : isSidebarCollapsed
                ? 'ml-15'
                : 'ml-55'
          )}
        >
          {/* Header */}
          <Header
            isMobile={isMobile}
            toggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
            isSidebarOpen={mobileSidebarOpen}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">{content}</main>
        </div>
      </div>
    </div>
  );
};

export default AppBody;