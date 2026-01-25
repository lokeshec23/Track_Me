import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  className = '',
  glass = false,
  onClick = null,
  hoverable = false
}) => {
  const cardClasses = [
    'card',
    glass ? 'card-glass' : '',
    hoverable || onClick ? 'card-hoverable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
