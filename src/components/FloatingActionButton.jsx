import React from 'react';
import './FloatingActionButton.css';

const FloatingActionButton = ({ onClick, icon = '+', label = 'Add' }) => {
    return (
        <button
            className="fab"
            onClick={onClick}
            aria-label={label}
            title={label}
        >
            <span className="fab-icon">{icon}</span>
        </button>
    );
};

export default FloatingActionButton;
