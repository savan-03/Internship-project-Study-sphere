import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';
import ResourceCard from '../components/resources/ResourceCard';
import { useResources } from '../components/context/ResourceContext';

const panelStyle = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.46)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '22px',
  backdropFilter: 'blur(16px)',
};

const ResourceCollectionDetail = () => {
  const { collectionId } = useParams();
  const { collections, bookmarkedResources, addToCollection, removeFromCollection } = useResources();
  const collection = collections.find((item) => item.id === collectionId);

  if (!collection) {
    return <Navigate to="/resources/collections" replace />;
  }

  const availableResources = bookmarkedResources.filter(
    (resource) => !collection.resourceIds.includes(resource.id)
  );
  const totalDownloads = (collection.resources || []).reduce(
    (sum, resource) => sum + Number(resource.downloads || 0),
    0
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '108px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <Link to="/resources/collections" style={{ display: 'inline-block', marginBottom: '16px', color: '#c4b5fd', textDecoration: 'none', fontWeight: 700 }}>Back to Collections</Link>
          <div style={{ marginBottom: '24px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.2), rgba(236,72,153,0.18))', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', backdropFilter: 'blur(16px)' }}>
            <p style={{ margin: 0, color: '#bfdbfe', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '12px' }}>Collection Detail</p>
            <h1 style={{ margin: '10px 0 6px', fontSize: '34px', fontWeight: 900 }}>{collection.name}</h1>
            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>{collection.description || 'A custom resource playlist for focused study.'}</p>
            <div style={{ marginTop: '22px', display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {[
                ['Resources', collection.resources.length, '#c4b5fd'],
                ['Bookmarks ready', availableResources.length, '#93c5fd'],
                ['Downloads', totalDownloads, '#86efac'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.07)', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{label}</div>
                  <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <ResourceModuleNav />

          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)' }}>
            <div>
              <h3 style={{ marginBottom: '14px', fontSize: '22px', fontWeight: 800 }}>Collection Resources</h3>
              {collection.resources.length === 0 ? (
                <div style={{ ...panelStyle, color: '#94a3b8' }}>No resources added yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {collection.resources.map((resource) => (
                    <div key={resource.id}>
                      <ResourceCard resource={resource} viewMode="grid" />
                      <button onClick={() => removeFromCollection(collection.id, resource.id)} style={{ marginTop: '10px', width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(127,29,29,0.2)', color: '#fecaca', cursor: 'pointer', fontWeight: 700 }}>Remove from collection</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ ...panelStyle, height: 'fit-content' }}>
              <h3 style={{ marginBottom: '14px', fontSize: '22px', fontWeight: 800 }}>Add bookmarked resources</h3>
              <p style={{ marginTop: 0, marginBottom: '16px', color: '#94a3b8', lineHeight: 1.6 }}>
                Only your bookmarked resources are shown here, so the collection stays curated from items you have already saved.
              </p>
              {availableResources.length === 0 ? (
                <p style={{ color: '#94a3b8', margin: 0 }}>Bookmark resources from the library to add them here.</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {availableResources.map((resource) => (
                    <div key={resource.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px' }}>
                      <div style={{ fontWeight: 700 }}>{resource.title}</div>
                      <div style={{ margin: '6px 0 10px', fontSize: '13px', color: '#94a3b8' }}>{resource.category} - {resource.type}</div>
                      <button onClick={() => addToCollection(collection.id, resource.id)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Resource</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceCollectionDetail;
