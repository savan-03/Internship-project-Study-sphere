import React, { useMemo } from 'react';
import { useResources } from '../context/ResourceContext';

const panelStyle = {
  background: 'linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(17,24,39,0.8) 100%)',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 30px 80px -42px rgba(0,0,0,0.85)',
  backdropFilter: 'blur(18px)',
  borderRadius: '26px',
  padding: '18px',
};

const sectionLabel = {
  display: 'block',
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontWeight: 800,
};

const chipStyle = (active) => ({
  padding: '9px 13px',
  background: active ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.05)',
  border: `1px solid ${active ? 'rgba(96,165,250,0.24)' : 'rgba(148,163,184,0.14)'}`,
  borderRadius: '999px',
  color: active ? '#ffffff' : '#cbd5e1',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: 700,
});

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(15,23,42,0.84)',
  border: '1px solid rgba(148,163,184,0.16)',
  borderRadius: '14px',
  color: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const ResourceFilters = () => {
  const { filters, setFilters } = useResources();

  const resourceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDFs' },
    { value: 'link', label: 'Links' },
    { value: 'notes', label: 'Notes' },
    { value: 'video', label: 'Videos' },
  ];

  const categories = ['all', 'DSA', 'AI/ML', 'JavaScript', 'React', 'System Design', 'Databases', 'Python', 'Java'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Top Rated' },
  ];
  const ratingOptions = [0, 4, 4.5, 4.8];

  const activeFilterCount = useMemo(() => {
    let total = 0;
    if (filters.search) total += 1;
    if (filters.type && filters.type !== 'all') total += 1;
    if (filters.category && filters.category !== 'all') total += 1;
    if (filters.sortBy && filters.sortBy !== 'newest') total += 1;
    if (filters.rating && Number(filters.rating) > 0) total += 1;
    return total;
  }, [filters]);

  const resetFilters = () =>
    setFilters({
      type: 'all',
      category: 'all',
      search: '',
      sortBy: 'newest',
      status: 'all',
      rating: 0,
    });

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Filters
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc' }}>Refine results</div>
        </div>
        <div
          style={{
            minWidth: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(96,165,250,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bfdbfe',
            fontSize: '18px',
            fontWeight: 900,
          }}
        >
          {activeFilterCount}
        </div>
      </div>

      <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '16px', background: 'rgba(30,41,59,0.62)', border: '1px solid rgba(148,163,184,0.14)', color: '#94a3b8', fontSize: '13px', lineHeight: 1.7 }}>
        Search by title, description, creator, category, or tags. Mix type and rating filters to surface the strongest material faster.
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={sectionLabel}>Search Resources</label>
        <input
          type="text"
          placeholder="Search by title, tag, category, or creator..."
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          style={fieldStyle}
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={sectionLabel}>Resource Type</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {resourceTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilters({ ...filters, type: type.value })}
              style={chipStyle(filters.type === type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={sectionLabel}>Category</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilters({ ...filters, category })}
              style={chipStyle(filters.category === category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={sectionLabel}>Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}
          style={fieldStyle}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={sectionLabel}>Minimum Rating</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters({ ...filters, rating })}
              style={chipStyle(Number(filters.rating) === rating)}
            >
              {rating === 0 ? 'Any Rating' : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={resetFilters}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(148,163,184,0.14)',
          borderRadius: '14px',
          color: '#cbd5e1',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Reset all filters
      </button>
    </div>
  );
};

export default ResourceFilters;
