// src/components/resources/components/ReviewList.jsx
import React, { useState } from 'react';
import RatingStars from './RatingStars';

const ReviewList = ({ reviews, onAddReview }) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (newRating > 0 && newComment.trim()) {
      onAddReview(newRating, newComment);
      setNewRating(0);
      setNewComment('');
      setShowForm(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      {/* Add Review Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', color: 'white' }}>
            Share your thoughts
          </h4>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', display: 'block' }}>
              Your Rating
            </label>
            <RatingStars 
              rating={newRating} 
              size={24} 
              interactive={true} 
              onRatingChange={setNewRating}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', display: 'block' }}>
              Your Review
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="4"
              placeholder="What did you think about this resource?"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={newRating === 0 || !newComment.trim()}
            style={{
              padding: '10px 20px',
              background: newRating === 0 || !newComment.trim() 
                ? 'rgba(255,255,255,0.1)' 
                : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '8px',
              color: newRating === 0 || !newComment.trim() ? '#9ca3af' : 'white',
              cursor: newRating === 0 || !newComment.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews List */}
      {reviews && reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((review, index) => (
            <div
              key={review.id || index}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {review.userAvatar || review.userName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>
                    {review.userName || 'Anonymous'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {formatDate(review.date)}
                  </div>
                </div>
              </div>
              <RatingStars rating={review.rating} size={12} />
              <p style={{ fontSize: '13px', color: '#d1d5db', marginTop: '10px', lineHeight: 1.5 }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px'
        }}>
          <p style={{ color: '#9ca3af' }}>No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;