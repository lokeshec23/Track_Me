import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';
import './HamburgerMenu.css';

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNavigation = (path) => {
        navigate(path);
        closeMenu();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        closeMenu();
    };

    return (
        <div className="hamburger-container" ref={menuRef}>
            <button
                className={`hamburger-btn ${isOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            <div className={`mobile-menu ${isOpen ? 'show' : ''}`}>
                <div className="mobile-menu-header">
                    <span className="mobile-user-name">Hello, {user?.name?.split(' ')[0]}</span>
                    <button className="close-btn" onClick={closeMenu}>✕</button>
                </div>

                <div className="mobile-menu-items">
                    <button onClick={() => handleNavigation('/dashboard')} className="mobile-menu-link">
                        <span className="icon">🏠</span> Dashboard
                    </button>
                    <button onClick={() => handleNavigation('/budget')} className="mobile-menu-link">
                        <span className="icon">💸</span> Budget
                    </button>
                    <button onClick={() => handleNavigation('/recurring')} className="mobile-menu-link">
                        <span className="icon">🔄</span> Recurring
                    </button>
                    <button onClick={() => handleNavigation('/goals')} className="mobile-menu-link">
                        <span className="icon">🎯</span> Goals
                    </button>
                    <button onClick={() => handleNavigation('/analytics')} className="mobile-menu-link">
                        <span className="icon">📊</span> Analytics
                    </button>
                    <button onClick={() => handleNavigation('/insights')} className="mobile-menu-link">
                        <span className="icon">💡</span> Insights
                    </button>
                    <div className="mobile-divider"></div>
                    <button onClick={() => handleNavigation('/settings')} className="mobile-menu-link">
                        <span className="icon">⚙️</span> Settings
                    </button>
                    <button onClick={toggleTheme} className="mobile-menu-link">
                        <span className="icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={handleLogout} className="mobile-menu-link text-danger">
                        <span className="icon">🚪</span> Logout
                    </button>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}
        </div>
    );
};

export default HamburgerMenu;
