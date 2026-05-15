import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import ResourceModuleNav from '../components/resources/ResourceModuleNav';
import { useResources } from '../components/context/ResourceContext';

const panelStyle = {
  borderRadius: '24px',
  background: 'rgba(15,23,42,0.46)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px',
  backdropFilter: 'blur(16px)',
};

const inputStyle = {
  width: '100%',
  marginBottom: '12px',
  padding: '13px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
};

const ResourceCollections = () => {
  const {
    collections,
    createCollection,
    updateCollection,
    deleteCollection,
    bookmarkedResources,
  } = useResources();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editingState, setEditingState] = useState({ name: '', description: '' });

  const suggestions = useMemo(() => bookmarkedResources.slice(0, 3), [bookmarkedResources]);
  const totalItems = collections.reduce(
    (sum, collection) => sum + Number(collection.resources?.length || 0),
    0
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createCollection({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
  };

  const startEditing = (collection) => {
    setEditingId(collection.id);
    setEditingState({
      name: collection.name || '',
      description: collection.description || '',
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingId || !editingState.name.trim()) return;
    await updateCollection(editingId, {
      name: editingState.name.trim(),
      description: editingState.description.trim(),
    });
    setEditingId('');
    setEditingState({ name: '', description: '' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050816 0%, #111827 55%, #1e1b4b 100%)', color: '#f8fafc' }}>
      <div style={{ paddingTop: '108px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: '24px', display: 'grid', gap: '20px', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)' }}>
            <div style={{ borderRadius: '28px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.2), rgba(236,72,153,0.18))', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', backdropFilter: 'blur(16px)' }}>
              <p style={{ margin: 0, color: '#bfdbfe', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '12px' }}>Collections</p>
              <h1 style={{ margin: '10px 0 6px', fontSize: '34px', fontWeight: 900 }}>Curate playlists for learning</h1>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.7 }}>Group related resources into collections for interview prep, revision, or team sharing.</p>
              <div style={{ marginTop: '22px', display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                {[
                  ['Collections', collections.length, '#c4b5fd'],
                  ['Saved items', totalItems, '#93c5fd'],
                  ['Bookmarks ready', bookmarkedResources.length, '#86efac'],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ borderRadius: '18px', background: 'rgba(255,255,255,0.07)', padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{label}</div>
                    <div style={{ marginTop: '8px', fontSize: '28px', fontWeight: 900, color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleCreate} style={panelStyle}>
              <h3 style={{ marginTop: 0, marginBottom: '14px', fontSize: '22px', fontWeight: 800 }}>New Collection</h3>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" style={inputStyle} />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this collection for?" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              <button type="submit" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Collection</button>
            </form>
          </div>

          <ResourceModuleNav />

          {collections.length === 0 ? (
            <div style={panelStyle}>
              <h3 style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 800 }}>No collections yet</h3>
              <p style={{ color: '#94a3b8' }}>Create your first collection, then add bookmarked resources to build a study playlist.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {collections.map((collection) => {
                const isEditing = editingId === collection.id;
                return (
                  <div key={collection.id} style={panelStyle}>
                    {isEditing ? (
                      <form onSubmit={handleUpdate}>
                        <input
                          value={editingState.name}
                          onChange={(event) =>
                            setEditingState((prev) => ({ ...prev, name: event.target.value }))
                          }
                          placeholder="Collection name"
                          style={inputStyle}
                        />
                        <textarea
                          value={editingState.description}
                          onChange={(event) =>
                            setEditingState((prev) => ({ ...prev, description: event.target.value }))
                          }
                          rows={4}
                          placeholder="Collection description"
                          style={{ ...inputStyle, resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="submit" style={{ flex: 1, padding: '11px 14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                          <button type="button" onClick={() => setEditingId('')} style={{ padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.16)', background: 'transparent', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div style={{ marginBottom: '10px', fontSize: '12px', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800 }}>Custom playlist</div>
                        <h3 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: 800 }}>{collection.name}</h3>
                        <p style={{ minHeight: '48px', color: '#cbd5e1', lineHeight: 1.7 }}>{collection.description || 'A focused set of resources for one study goal.'}</p>
                        <div style={{ marginTop: '16px', display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                          <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>Resources</div>
                            <div style={{ marginTop: '6px', fontWeight: 800 }}>{collection.resources.length}</div>
                          </div>
                          <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>Created</div>
                            <div style={{ marginTop: '6px', fontWeight: 800 }}>
                              {collection.createdAt
                                ? new Date(collection.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'Recently'}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <Link to={`/resources/collections/${collection.id}`} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '11px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', fontWeight: 700 }}>Open</Link>
                          <button type="button" onClick={() => startEditing(collection)} style={{ padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(96,165,250,0.24)', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                          <button type="button" onClick={() => deleteCollection(collection.id)} style={{ padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(248,113,113,0.24)', background: 'rgba(127,29,29,0.22)', color: '#fecaca', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!!suggestions.length && (
            <div style={{ marginTop: '28px', ...panelStyle }}>
              <h3 style={{ marginBottom: '14px', fontSize: '22px', fontWeight: 800 }}>Suggested items from bookmarks</h3>
              <div style={{ display: 'grid', gap: '14px' }}>
                {suggestions.map((resource) => (
                  <div key={resource.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px' }}>
                    <div style={{ fontWeight: 700 }}>{resource.title}</div>
                    <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '13px' }}>{resource.category} - {resource.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceCollections;
