import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import Lenis from 'lenis';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Attach Lenis to the window for best performance and native feel
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth Apple-like spring
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="main-layout-wrapper">
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)} 
      />

      <div className="main-content-area">
        <Navbar 
          onToggleMobile={() => setMobileMenuOpen(prev => !prev)} 
        />

        {/* Main Content Area */}
        <div className="main-children-container">
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
