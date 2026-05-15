import React from 'react';
import { useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';

const typeConfig = {
  pdf: { label: 'PDF', icon: 'PDF', accent: '#f87171', tint: '248,113,113' },
  link: { label: 'Link', icon: 'URL', accent: '#60a5fa', tint: '96,165,250' },
  notes: { label: 'Notes', icon: 'TXT', accent: '#34d399', tint: '52,211,153' },
  video: { label: 'Video', icon: 'VID', accent: '#fbbf24', tint: '251,191,36' },
};

const statusConfig = {
  approved: {
    label: 'Approved',
    border: '1px solid rgba(148,163,184,0.14)',
    chipBackground: 'rgba(34,197,94,0.16)',
    chipColor: '#bbf7d0',
  },
  pending: {
    label: 'Pending',
    border: '1px solid rgba(245,158,11,0.28)',
    chipBackground: 'rgba(245,158,11,0.16)',
    chipColor: '#fde68a',
  },
  rejected: {
    label: 'Rejected',
    border: '1px solid rgba(248,113,113,0.28)',
    chipBackground: 'rgba(127,29,29,0.42)',
    chipColor: '#fecaca',
  },
};

const baseCardStyle = {
  background: 'linear-gradient(180deg, rgba(15,23,42,0.86) 0%, rgba(17,24,39,0.8) 100%)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 26px 70px -40px rgba(0,0,0,0.86)',
  cursor: 'pointer',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
};

const ResourceCard = ({ resource, viewMode }) => {
  const navigate = useNavigate();
  const previewText = resource.description?.trim()
    ? `${resource.description.substring(0, 118)}${resource.description.length > 118 ? '...' : ''}`
    : 'Open this resource to see the full description, review signals, and download context.';
  const currentType = typeConfig[resource.type] || typeConfig.notes;
  const currentStatus = statusConfig[resource.status] || statusConfig.approved;

  const formatDate = (date) => {
    if (!date) return 'Recently added';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const creatorLabel =
    resource.uploadedBy?.name || resource.creator?.fullName || resource.creator?.username || 'Unknown';

  const topTags = (resource.tags || []).slice(0, 3);

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => navigate(`/resources/${resource.id}`)}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform = 'translateY(-2px)';
          event.currentTarget.style.boxShadow = '0 34px 70px -38px rgba(59,130,246,0.34)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = 'translateY(0)';
          event.currentTarget.style.boxShadow = baseCardStyle.boxShadow;
        }}
        style={{
          ...baseCardStyle,
          borderRadius: '22px',
          padding: '22px',
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
          border: currentStatus.border,
        }}
      >
        <div
          style={{
            width: '72px',
            minWidth: '72px',
            height: '72px',
            borderRadius: '22px',
            background: `linear-gradient(135deg, rgba(${currentType.tint}, 0.2), rgba(${currentType.tint}, 0.08))`,
            border: `1px solid rgba(${currentType.tint}, 0.18)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            color: currentType.accent,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em' }}>{currentType.icon}</div>
          <div style={{ fontSize: '10px', color: '#cbd5e1' }}>{currentType.label}</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>{resource.title}</h3>
            <span
              style={{
                padding: '5px 10px',
                background: currentStatus.chipBackground,
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                color: currentStatus.chipColor,
              }}
            >
              {currentStatus.label}
            </span>
          </div>

          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.7 }}>
            {previewText}
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'rgba(59,130,246,0.12)',
                color: '#bfdbfe',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {resource.category}
            </span>
            {topTags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(139,92,246,0.12)',
                  color: '#ddd6fe',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', color: '#94a3b8', fontSize: '12px' }}>
            <span>By {creatorLabel}</span>
            <span>{formatDate(resource.uploadedAt)}</span>
            <span>{resource.type === 'link' ? 'Link resource' : resource.fileName || currentType.label}</span>
          </div>
        </div>

        <div style={{ minWidth: '160px', textAlign: 'right' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#e2e8f0' }}>{resource.downloads || 0}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {resource.type === 'link' ? 'Clicks' : 'Downloads'}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
            <RatingStars rating={resource.rating} size={13} />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{resource.reviewCount} reviews</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/resources/${resource.id}`)}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-4px)';
        event.currentTarget.style.boxShadow = '0 34px 70px -38px rgba(59,130,246,0.36)';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateY(0)';
        event.currentTarget.style.boxShadow = baseCardStyle.boxShadow;
      }}
      style={{
        ...baseCardStyle,
        borderRadius: '24px',
        padding: '22px',
        border: currentStatus.border,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '18px' }}>
        <div
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '18px',
            background: `linear-gradient(135deg, rgba(${currentType.tint}, 0.2), rgba(${currentType.tint}, 0.08))`,
            border: `1px solid rgba(${currentType.tint}, 0.18)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            color: currentType.accent,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em' }}>{currentType.icon}</div>
          <div style={{ fontSize: '9px', color: '#cbd5e1' }}>{currentType.label}</div>
        </div>

        <span
          style={{
            padding: '6px 10px',
            background: currentStatus.chipBackground,
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 800,
            color: currentStatus.chipColor,
          }}
        >
          {currentStatus.label}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: '#f8fafc', lineHeight: 1.2 }}>
          {resource.title}
        </h3>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.75 }}>
          {previewText}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>By {creatorLabel}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDate(resource.uploadedAt)}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <span
          style={{
            padding: '6px 10px',
            borderRadius: '999px',
            background: 'rgba(59,130,246,0.12)',
            color: '#bfdbfe',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {resource.category}
        </span>
        {topTags.map((tag) => (
          <span
            key={tag}
            style={{
              padding: '6px 10px',
              borderRadius: '999px',
              background: 'rgba(139,92,246,0.12)',
              color: '#ddd6fe',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        <div style={{ padding: '10px 12px', borderRadius: '16px', background: 'rgba(30,41,59,0.58)', border: '1px solid rgba(148,163,184,0.12)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Pulls</div>
          <div style={{ fontSize: '18px', fontWeight: 900 }}>{resource.downloads || 0}</div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: '16px', background: 'rgba(30,41,59,0.58)', border: '1px solid rgba(148,163,184,0.12)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Views</div>
          <div style={{ fontSize: '18px', fontWeight: 900 }}>{resource.views || 0}</div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: '16px', background: 'rgba(30,41,59,0.58)', border: '1px solid rgba(148,163,184,0.12)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Reviews</div>
          <div style={{ fontSize: '18px', fontWeight: 900 }}>{resource.reviewCount || 0}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(148,163,184,0.12)', paddingTop: '14px' }}>
        <RatingStars rating={resource.rating} size={14} />
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {resource.type === 'link' ? 'Open link details' : resource.fileName || 'Open resource details'}
        </span>
      </div>
    </div>
  );
};

export default ResourceCard;
