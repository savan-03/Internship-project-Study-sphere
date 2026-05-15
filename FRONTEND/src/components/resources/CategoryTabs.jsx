import React from 'react';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '10px',
        marginBottom: '18px',
        scrollbarWidth: 'thin',
      }}
    >
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            style={{
              padding: '10px 16px',
              background: isActive
                ? 'linear-gradient(135deg, rgba(59,130,246,0.96), rgba(139,92,246,0.96))'
                : 'rgba(15,23,42,0.76)',
              border: `1px solid ${isActive ? 'rgba(96,165,250,0.2)' : 'rgba(148,163,184,0.14)'}`,
              borderRadius: '999px',
              color: isActive ? '#ffffff' : '#cbd5e1',
              fontSize: '13px',
              fontWeight: isActive ? 800 : 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 18px 30px -22px rgba(59,130,246,0.8)' : 'none',
            }}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
