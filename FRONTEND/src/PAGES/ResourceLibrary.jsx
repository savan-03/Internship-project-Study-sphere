import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../components/context/ResourceContext';
import ResourceCard from '../components/resources/ResourceCard';
import ResourceFilters from '../components/resources/ResourceFilters';
import CategoryTabs from '../components/resources/CategoryTabs';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';

const categories = [
  'All',
  'DSA',
  'AI/ML',
  'JavaScript',
  'React',
  'System Design',
  'Databases',
  'Python',
  'Java',
];

const shellStyle = {
  minHeight: '100vh',
  backgroundColor: '#050816',
  color: '#f8fafc',
  overflow: 'hidden',
  position: 'relative',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const glassPanel = {
  background: 'linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(17,24,39,0.78) 100%)',
  border: '1px solid rgba(148,163,184,0.16)',
  boxShadow: '0 30px 80px -42px rgba(0,0,0,0.85)',
  backdropFilter: 'blur(18px)',
};

const statCard = {
  ...glassPanel,
  borderRadius: '22px',
  padding: '18px 18px 16px',
};

const ResourceLibrary = () => {
  const navigate = useNavigate();
  const { resources, loading, filters, setFilters } = useResources();
  const [viewMode, setViewMode] = useState('grid');

  const stats = useMemo(() => {
    const downloads = resources.reduce((sum, resource) => sum + Number(resource.downloads || 0), 0);
    const categoriesCovered = new Set(resources.map((resource) => resource.category).filter(Boolean)).size;
    const topRated = resources.filter((resource) => Number(resource.rating || 0) >= 4.5).length;
    return {
      total: resources.length,
      downloads,
      categoriesCovered,
      topRated,
    };
  }, [resources]);

  const statusMessage = loading
    ? 'Refreshing the library and filtering the latest community uploads.'
    : resources.length
      ? `Showing ${resources.length} resource${resources.length === 1 ? '' : 's'} matched to your current filters.`
      : 'No resources matched the current filters yet.';

  return (
    <div style={shellStyle}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(135deg, rgba(2,6,23,0.98) 0%, rgba(17,24,39,0.96) 38%, rgba(30,27,75,0.92) 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '62px 62px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-4%',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            filter: 'blur(90px)',
            background: 'radial-gradient(circle, rgba(59,130,246,0.34) 0%, rgba(59,130,246,0.02) 72%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-2%',
            width: '560px',
            height: '560px',
            borderRadius: '50%',
            filter: 'blur(100px)',
            background: 'radial-gradient(circle, rgba(236,72,153,0.28) 0%, rgba(236,72,153,0.02) 74%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-12%',
            left: '34%',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            filter: 'blur(92px)',
            background: 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0.02) 74%)',
          }}
        />
      </div>

      <div style={{ height: '84px', position: 'relative', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 20px 46px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <section
            style={{
              ...glassPanel,
              borderRadius: '34px',
              padding: '28px',
              marginBottom: '22px',
            }}
          >
            <div className="resource-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 0.9fr)', gap: '24px', alignItems: 'stretch' }}>
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    background: 'rgba(96,165,250,0.14)',
                    border: '1px solid rgba(96,165,250,0.18)',
                    color: '#bfdbfe',
                    fontSize: '12px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    marginBottom: '14px',
                  }}
                >
                  Resource Sharing
                </div>
                <h1
                  style={{
                    fontSize: 'clamp(32px, 5vw, 52px)',
                    lineHeight: 1.02,
                    margin: '0 0 12px',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Build a sharper
                  <br />
                  community library.
                </h1>
                <p
                  style={{
                    maxWidth: '700px',
                    margin: '0 0 18px',
                    color: '#94a3b8',
                    fontSize: '16px',
                    lineHeight: 1.75,
                  }}
                >
                  Discover high-signal notes, DSA sheets, AI learning packs, and practical study material.
                  This module is now tuned for faster browsing, clearer filtering, and stronger upload discovery.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button
                    onClick={() => navigate('/resources/upload')}
                    style={{
                      padding: '13px 20px',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 20px 38px -24px rgba(59,130,246,0.9)',
                    }}
                  >
                    Upload a resource
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, search: '', type: 'all', category: 'all', rating: 0, sortBy: 'newest', status: 'all' })}
                    style={{
                      padding: '13px 20px',
                      borderRadius: '16px',
                      border: '1px solid rgba(148,163,184,0.18)',
                      background: 'rgba(15,23,42,0.72)',
                      color: '#cbd5e1',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Reset browsing state
                  </button>
                </div>
              </div>

              <div
                style={{
                  ...glassPanel,
                  borderRadius: '28px',
                  padding: '18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '14px',
                  alignContent: 'start',
                }}
              >
                <div style={statCard}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
                    In library
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: 900, marginBottom: '4px' }}>{stats.total}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>resources currently visible</div>
                </div>
                <div style={statCard}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
                    Total pulls
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: 900, marginBottom: '4px' }}>{stats.downloads}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>downloads and clicks</div>
                </div>
                <div style={statCard}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
                    Topics covered
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: 900, marginBottom: '4px' }}>{stats.categoriesCovered}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>active categories right now</div>
                </div>
                <div style={statCard}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
                    Highly rated
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: 900, marginBottom: '4px' }}>{stats.topRated}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>resources at 4.5+ rating</div>
                </div>
              </div>
            </div>
          </section>

          <ResourceModuleNav />

          <div className="resource-layout" style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '22px', alignItems: 'start' }}>
            <aside style={{ display: 'grid', gap: '18px' }}>
              <ResourceFilters />
            </aside>

            <section style={{ minWidth: 0 }}>
              <CategoryTabs
                categories={categories}
                activeCategory={filters.category === 'all' ? 'All' : filters.category}
                onCategoryChange={(category) =>
                  setFilters({ ...filters, category: category === 'All' ? 'all' : category })
                }
              />

              <div
                style={{
                  ...glassPanel,
                  borderRadius: '26px',
                  padding: '18px 18px 16px',
                  marginBottom: '18px',
                }}
              >
                <div
                  className="resource-toolbar"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Current view
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px' }}>Resource Explorer</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7 }}>{statusMessage}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{
                        padding: '10px 14px',
                        minWidth: '112px',
                        borderRadius: '14px',
                        border: '1px solid rgba(148,163,184,0.16)',
                        background: viewMode === 'grid' ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
                        color: viewMode === 'grid' ? '#dbeafe' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      Grid view
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{
                        padding: '10px 14px',
                        minWidth: '112px',
                        borderRadius: '14px',
                        border: '1px solid rgba(148,163,184,0.16)',
                        background: viewMode === 'list' ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.04)',
                        color: viewMode === 'list' ? '#e9d5ff' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      List view
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div
                  style={{
                    ...glassPanel,
                    borderRadius: '28px',
                    padding: '72px 28px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '3px solid rgba(96,165,250,0.16)',
                      borderTopColor: '#a78bfa',
                      margin: '0 auto 18px',
                      animation: 'resourceSpin 1s linear infinite',
                    }}
                  />
                  <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Loading resources</div>
                  <div style={{ color: '#94a3b8' }}>Pulling the latest uploads, ratings, and filters.</div>
                </div>
              ) : resources.length === 0 ? (
                <div
                  style={{
                    ...glassPanel,
                    borderRadius: '28px',
                    padding: '58px 28px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '78px',
                      height: '78px',
                      borderRadius: '24px',
                      margin: '0 auto 20px',
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.22))',
                      border: '1px solid rgba(148,163,184,0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: 900,
                      color: '#bfdbfe',
                    }}
                  >
                    RS
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>No resources found</div>
                  <div style={{ color: '#94a3b8', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 22px' }}>
                    Try broadening your filters, switching categories, or adding a new upload so the library has
                    more to surface.
                  </div>
                  <button
                    onClick={() => navigate('/resources/upload')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Upload the first matching resource
                  </button>
                </div>
              ) : (
                <div
                  className="resource-results-grid"
                  style={{
                    display: viewMode === 'grid' ? 'grid' : 'flex',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(320px, 1fr))' : 'none',
                    flexDirection: viewMode === 'list' ? 'column' : 'row',
                    gap: '18px',
                  }}
                >
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes resourceSpin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1080px) {
          .resource-layout,
          .resource-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .resource-toolbar {
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResourceLibrary;
