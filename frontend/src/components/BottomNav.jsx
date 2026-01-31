import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', icon: '🏠', label: 'Home' },
        { path: '/budget', icon: '💸', label: 'Budget' },
        { path: '/goals', icon: '🎯', label: 'Goals' },
        { path: '/analytics', icon: '📊', label: 'Analytics' },
        { path: '/insights', icon: '💡', label: 'Insights' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.path}
                    className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    aria-label={item.label}
                >
                    <span className="bottom-nav-icon">{item.icon}</span>
                    <span className="bottom-nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
