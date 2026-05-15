import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';
import ResourceCard from '../components/resources/ResourceCard';
import { useResources } from '../components/context/ResourceContext';

const ResourceSaved = () => {
  const { bookmarkedResources } = useResources();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '108px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '24px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.2), rgba(236,72,153,0.18))', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', backdropFilter: 'blur(16px)' }}>
            <p style={{ margin: 0, color: '#bfdbfe', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '12px' }}>Saved Resources</p>
            <h1 style={{ margin: '10px 0 6px', fontSize: '34px', fontWeight: 900 }}>Your bookmarked library</h1>
            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>Keep the resources you want to revisit in one quick-access space.</p>
          </div>

          <ResourceModuleNav />

          {bookmarkedResources.length === 0 ? (
            <div style={{ borderRadius: '24px', background: 'rgba(15,23,42,0.46)', border: '1px solid rgba(255,255,255,0.08)', padding: '36px', textAlign: 'center', backdropFilter: 'blur(16px)' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 800 }}>No bookmarks yet</h3>
              <p style={{ marginBottom: '20px', color: '#94a3b8' }}>Start saving important resources from the library and they will show up here.</p>
              <Link to="/resources" style={{ display: 'inline-block', padding: '12px 18px', borderRadius: '12px', textDecoration: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 700 }}>Browse Library</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {bookmarkedResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} viewMode="grid" />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceSaved;
