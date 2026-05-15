import React from 'react';
import Footer from '../components/layout/Footer';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';
import ReviewList from '../components/resources/ReviewList';
import { useAuth } from '../components/context/AuthContext';
import { useResources } from '../components/context/ResourceContext';

const ResourceReviewsPage = () => {
  const { user } = useAuth();
  const { resourcesWithReviews, addReview, getResourceReviews } = useResources();

  const topReviewed = resourcesWithReviews
    .filter((resource) => (resource.reviewCount || 0) > 0)
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '108px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '24px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.2), rgba(236,72,153,0.18))', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', backdropFilter: 'blur(16px)' }}>
            <p style={{ margin: 0, color: '#bfdbfe', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '12px' }}>Reviews</p>
            <h1 style={{ margin: '10px 0 6px', fontSize: '34px', fontWeight: 900 }}>Quality signals from the community</h1>
            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>Explore review activity and contribute feedback on the most useful resources.</p>
          </div>

          <ResourceModuleNav />

          {topReviewed.length === 0 ? (
            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '32px', color: '#94a3b8', textAlign: 'center', backdropFilter: 'blur(16px)' }}>No reviews yet. Open a resource detail page and be the first to review one.</div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {topReviewed.slice(0, 6).map((resource) => (
                <div key={resource.id} style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', backdropFilter: 'blur(16px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>{resource.title}</h3>
                      <div style={{ color: '#94a3b8', fontSize: '13px' }}>{resource.category} • {resource.reviewCount} reviews • Rating {Number(resource.rating || 0).toFixed(1)}</div>
                    </div>
                    <button
                      onClick={() =>
                        addReview(resource.id, {
                          userName: user?.fullName || user?.username || 'StudySphere User',
                          userAvatar: user?.avatar || 'SS',
                          rating: 5,
                          comment: 'Helpful resource with clear explanations and strong study value.',
                        })
                      }
                      style={{ padding: '11px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Add Quick Review
                    </button>
                  </div>
                  <ReviewList reviews={getResourceReviews(resource.id)} onAddReview={(rating, comment) => addReview(resource.id, {
                    userName: user?.fullName || user?.username || 'StudySphere User',
                    userAvatar: user?.avatar || 'SS',
                    rating,
                    comment,
                  })} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceReviewsPage;
