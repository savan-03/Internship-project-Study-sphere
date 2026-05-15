// src/components/resources/components/RatingStars.jsx
import React from 'react';

const RatingStars = ({ rating, size = 16, interactive = false, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {stars.map(star => (
        <span
          key={star}
          onClick={() => handleStarClick(star)}
          style={{
            fontSize: `${size}px`,
            cursor: interactive ? 'pointer' : 'default',
            color: star <= rating ? '#fbbf24' : '#4b5563',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (interactive) {
              e.currentTarget.style.transform = 'scale(1.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (interactive) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;