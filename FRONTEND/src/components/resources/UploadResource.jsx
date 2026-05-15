// src/components/resources/pages/UploadResource.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../context/ResourceContext.jsx';
import UploadProgress from '../resources/UploadProgress.jsx';
import ResourceModuleNav from './ResourceModuleNav.jsx';

const inputBaseStyle = {
  width: '100%',
  padding: '12px',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
};

const fieldLabelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  marginBottom: '8px',
};

const UploadResource = () => {
  const navigate = useNavigate();
  const { uploadResource } = useResources();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    category: 'DSA',
    tags: '',
    url: '',
    prerequisites: '',
    verificationNotes: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = ['DSA', 'AI/ML', 'JavaScript', 'React', 'System Design', 'Databases', 'Python', 'Java'];
  const resourceTypes = [
    {
      value: 'pdf',
      label: 'PDF',
      caption: 'Upload notes, sheets, and guides.',
    },
    {
      value: 'link',
      label: 'Link',
      caption: 'Share an external article or course.',
    },
    {
      value: 'notes',
      label: 'Notes',
      caption: 'Post typed notes without a file.',
    },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.type === 'link' && !formData.url.trim()) newErrors.url = 'URL is required';
    if (formData.type === 'pdf' && !formData.file) newErrors.file = 'File is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.tags.trim()) newErrors.tags = 'At least one tag is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress(0);
    setSubmitError('');

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    const resourceData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      prerequisites: formData.prerequisites.split(',').map(item => item.trim()).filter(Boolean),
      verificationNotes: formData.verificationNotes.trim(),
      ...(formData.type === 'link'
        ? { externalUrl: formData.url }
        : { file: formData.file, fileName: formData.file?.name, fileSize: formData.file?.size })
    };

    try {
      await uploadResource(resourceData);

      setTimeout(() => {
        setUploading(false);
        navigate('/resources/my-uploads');
      }, 1500);
    } catch (error) {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(0);
      setSubmitError(error.response?.data?.message || 'Unable to upload resource right now.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(79,70,229,0.1) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(168,85,247,0.1) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div style={{ height: '80px', position: 'relative', zIndex: 1 }}></div>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Share a Resource
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: '32px' }}>
            Help the community by sharing valuable learning materials
          </p>

          <ResourceModuleNav />

          {uploading && <UploadProgress progress={uploadProgress} />}
          {submitError && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(239,68,68,0.5)',
              background: 'rgba(239,68,68,0.12)',
              color: '#fca5a5',
              fontSize: '14px'
            }}>
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Complete DSA Study Guide"
                style={{
                  ...inputBaseStyle,
                  border: `1px solid ${errors.title ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                }}
              />
              {errors.title && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.title}</p>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe what this resource covers and why it's useful..."
                style={{
                  ...inputBaseStyle,
                  border: `1px solid ${errors.description ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              {errors.description && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.description}</p>}
            </div>

            {/* Resource Type */}
            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>
                Resource Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {resourceTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'type', value: type.value } })}
                    style={{
                      textAlign: 'left',
                      padding: '16px',
                      borderRadius: '14px',
                      border: formData.type === type.value ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      background: formData.type === type.value ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{type.label}</div>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#9ca3af', lineHeight: 1.6 }}>{type.caption}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Fields */}
            {formData.type === 'link' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={fieldLabelStyle}>
                  URL *
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/resource"
                  style={{
                    ...inputBaseStyle,
                    border: `1px solid ${errors.url ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  }}
                />
                {errors.url && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.url}</p>}
              </div>
            )}

            {formData.type === 'pdf' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={fieldLabelStyle}>
                  Upload PDF *
                </label>
                <label
                  htmlFor="resource-file"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.08)',
                    border: `1px solid ${errors.file ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: formData.file ? '#fff' : '#cbd5e1' }}>
                    {formData.file ? formData.file.name : 'Choose a PDF to upload'}
                  </span>
                  <span style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(59,130,246,0.18)', color: '#bfdbfe', fontSize: '12px', fontWeight: 700 }}>
                    Browse
                  </span>
                </label>
                <input
                  id="resource-file"
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                {errors.file && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.file}</p>}
              </div>
            )}

            {/* Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>
                Category *
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'category', value: cat } })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '999px',
                      border: formData.category === cat
                        ? '1px solid rgba(96,165,250,0.45)'
                        : `1px solid ${errors.category ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                      background: formData.category === cat
                        ? 'rgba(59,130,246,0.18)'
                        : 'rgba(255,255,255,0.05)',
                      color: formData.category === cat ? '#bfdbfe' : '#e5e7eb',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.category}</p>}
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabelStyle}>
                Tags *
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., javascript, algorithms, interview (comma separated)"
                style={{
                  ...inputBaseStyle,
                  border: `1px solid ${errors.tags ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                }}
              />
              {errors.tags && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>{errors.tags}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>
                Prerequisites
              </label>
              <input
                type="text"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                placeholder="e.g., arrays, recursion, sorting"
                style={{
                  ...inputBaseStyle,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={fieldLabelStyle}>
                Verification Notes
              </label>
              <textarea
                name="verificationNotes"
                value={formData.verificationNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Optional context for reviewers, OCR checks, or content source."
                style={{
                  ...inputBaseStyle,
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="submit"
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.7 : 1
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Resource'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/resources')}
                style={{
                  padding: '14px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(100vh); }
          to { transform: translateY(-100vh); }
        }
      `}</style>
    </div>
  );
};

export default UploadResource;
