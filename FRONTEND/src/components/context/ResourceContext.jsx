import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from './Axiosinstance';
import { useAuth } from './AuthContext';

const ResourceContext = createContext(null);

const normalizeResource = (resource = {}) => {
  const creator = resource.creator || null;
  const creatorName =
    creator?.fullName || creator?.username || resource.uploadedBy?.name || 'Unknown';

  return {
    id: resource.id || resource._id || '',
    title: resource.title || '',
    description: resource.description || '',
    type: resource.type || 'pdf',
    category: resource.category || 'General',
    status: resource.status || 'pending',
    tags: Array.isArray(resource.tags) ? resource.tags : [],
    uploadedAt: resource.uploadedAt || resource.createdAt || '',
    createdAt: resource.createdAt || resource.uploadedAt || '',
    updatedAt: resource.updatedAt || '',
    views: Number(resource.views || 0),
    downloads: Number(resource.downloads || 0),
    fileName: resource.fileName || '',
    fileSize: resource.fileSize || '',
    externalUrl: resource.externalUrl || '',
    rejectionReason: resource.rejectionReason || '',
    prerequisites: Array.isArray(resource.prerequisites) ? resource.prerequisites : [],
    ocrText: resource.ocrText || '',
    extractedSummary: resource.extractedSummary || '',
    plagiarismScore: Number(resource.plagiarismScore || 0),
    plagiarismMatches: Array.isArray(resource.plagiarismMatches) ? resource.plagiarismMatches : [],
    verificationNotes: resource.verificationNotes || '',
    versionHistory: Array.isArray(resource.versionHistory) ? resource.versionHistory : [],
    moderationHistory: Array.isArray(resource.moderationHistory) ? resource.moderationHistory : [],
    creator: creator
      ? {
          id: creator.id || creator._id || '',
          fullName: creator.fullName || '',
          username: creator.username || '',
          email: creator.email || '',
          role: creator.role || 'user',
        }
      : null,
    uploadedBy: {
      id: creator?.id || creator?._id || '',
      name: creatorName,
    },
    rating: Number(resource.rating || 0),
    reviewCount: Number(resource.reviewCount || 0),
    reviews: Array.isArray(resource.reviews) ? resource.reviews : [],
    comments: Array.isArray(resource.comments) ? resource.comments : [],
  };
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};

export const ResourceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [allResources, setAllResources] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [collections, setCollections] = useState([]);
  const [reviewsByResource, setReviewsByResource] = useState({});
  const [commentsByResource, setCommentsByResource] = useState({});
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: '',
    sortBy: 'newest',
    status: 'all',
    rating: 0,
  });

  const syncReviewMap = useCallback((resources) => {
    const nextMap = {};
    (resources || []).forEach((resource) => {
      nextMap[resource.id] = resource.reviews || [];
    });
    setReviewsByResource((prev) => ({ ...prev, ...nextMap }));
  }, []);

  const syncCommentMap = useCallback((resources) => {
    const nextMap = {};
    (resources || []).forEach((resource) => {
      nextMap[resource.id] = resource.comments || [];
    });
    setCommentsByResource((prev) => ({ ...prev, ...nextMap }));
  }, []);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/resources');
      const normalizedResources = (data.resources || []).map(normalizeResource);
      setAllResources(normalizedResources);
      syncReviewMap(normalizedResources);
      syncCommentMap(normalizedResources);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load resources.');
      setAllResources([]);
    } finally {
      setLoading(false);
    }
  }, [syncCommentMap, syncReviewMap]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const fetchPersonalResourceData = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarkedResources([]);
      setCollections([]);
      setMyUploads([]);
      return;
    }

    try {
      const [bookmarksRes, collectionsRes, reviewsRes, uploadsRes] = await Promise.all([
        api.get('/resources/bookmarks/me'),
        api.get('/resources/collections/me'),
        api.get('/resources/reviews'),
        api.get('/resources/my-uploads'),
      ]);

      setBookmarkedResources((bookmarksRes.data.resources || []).map(normalizeResource));
      setCollections(collectionsRes.data.collections || []);
      setMyUploads((uploadsRes.data.resources || []).map(normalizeResource));
      const reviewedResources = (reviewsRes.data.resources || []).map(normalizeResource);
      syncReviewMap(reviewedResources);
      syncCommentMap(reviewedResources);
    } catch {
      setBookmarkedResources([]);
      setCollections([]);
      setMyUploads([]);
    }
  }, [isAuthenticated, syncCommentMap, syncReviewMap]);

  useEffect(() => {
    fetchPersonalResourceData();
  }, [fetchPersonalResourceData]);

  const getResourceById = useCallback(
    async (id) => {
      const existing = allResources.find((resource) => resource.id === id);
      if (existing) {
        return existing;
      }

      const { data } = await api.get(`/resources/${id}`);
      const normalized = normalizeResource(data.resource);
      setAllResources((prev) => {
        const exists = prev.some((resource) => resource.id === normalized.id);
        return exists
          ? prev.map((resource) => (resource.id === normalized.id ? normalized : resource))
          : [normalized, ...prev];
      });
      syncReviewMap([normalized]);
      syncCommentMap([normalized]);
      return normalized;
    },
    [allResources, syncCommentMap, syncReviewMap]
  );

  const uploadResource = useCallback(async (resourceData) => {
    let requestBody;
    let config;

    if (resourceData.file) {
      const formData = new FormData();
      formData.append('title', resourceData.title);
      formData.append('description', resourceData.description || '');
      formData.append('type', resourceData.type || 'pdf');
      formData.append('category', resourceData.category || 'General');
      formData.append('externalUrl', resourceData.url || resourceData.externalUrl || '');
      formData.append('fileName', resourceData.fileName || resourceData.file.name || '');
      formData.append('fileSize', resourceData.fileSize ? String(resourceData.fileSize) : String(resourceData.file.size || ''));
      (resourceData.tags || []).forEach((tag) => formData.append('tags', tag));
      (resourceData.prerequisites || []).forEach((item) => formData.append('prerequisites', item));
      formData.append('verificationNotes', resourceData.verificationNotes || '');
      formData.append('file', resourceData.file);
      requestBody = formData;
      config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
    } else {
      requestBody = {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        category: resourceData.category,
        tags: resourceData.tags || [],
        externalUrl: resourceData.url || resourceData.externalUrl || '',
        fileName: resourceData.fileName || '',
        fileSize: resourceData.fileSize ? String(resourceData.fileSize) : '',
        documents: resourceData.documents || [],
        prerequisites: resourceData.prerequisites || [],
        verificationNotes: resourceData.verificationNotes || '',
      };
    }

    const fallbackResource = {
      title: resourceData.title,
      description: resourceData.description,
      type: resourceData.type,
      category: resourceData.category,
      tags: resourceData.tags || [],
      prerequisites: resourceData.prerequisites || [],
      verificationNotes: resourceData.verificationNotes || '',
      externalUrl: resourceData.url || resourceData.externalUrl || '',
      fileName: resourceData.fileName || resourceData.file?.name || '',
      fileSize: resourceData.fileSize ? String(resourceData.fileSize) : String(resourceData.file?.size || ''),
    };

    const { data } = await api.post('/resources', requestBody, config);
    const nextResource = normalizeResource(data.file || data.resource || fallbackResource);
    setAllResources((prev) => [nextResource, ...prev]);
    setMyUploads((prev) => [nextResource, ...prev]);
    syncReviewMap([nextResource]);
    syncCommentMap([nextResource]);
    return nextResource;
  }, [syncCommentMap, syncReviewMap]);

  const fetchMyUploads = useCallback(async () => {
    if (!isAuthenticated) {
      setMyUploads([]);
      return [];
    }

    const { data } = await api.get('/resources/my-uploads');
    const normalized = (data.resources || []).map(normalizeResource);
    setMyUploads(normalized);
    syncReviewMap(normalized);
    syncCommentMap(normalized);
    return normalized;
  }, [isAuthenticated, syncCommentMap, syncReviewMap]);

  const toggleBookmark = useCallback((resourceId) => {
    return api.post(`/resources/${resourceId}/bookmark`).then(({ data }) => {
      const nextBookmarks = (data.bookmarks || []).map(normalizeResource);
      setBookmarkedResources(nextBookmarks);
      return data.bookmarked;
    });
  }, []);

  const createCollection = useCallback(({ name, description = '' }) => {
    return api.post('/resources/collections', { name, description }).then(({ data }) => {
      setCollections(data.collections || []);
      return data.collections?.[0] || null;
    });
  }, []);

  const updateCollection = useCallback((collectionId, { name, description = '' }) => {
    return api
      .patch(`/resources/collections/${collectionId}`, { name, description })
      .then(({ data }) => {
        setCollections(data.collections || []);
        return (data.collections || []).find((collection) => collection.id === collectionId) || null;
      });
  }, []);

  const addToCollection = useCallback((collectionId, resourceId) => {
    return api
      .post(`/resources/collections/${collectionId}/resources/${resourceId}`)
      .then(({ data }) => {
        setCollections(data.collections || []);
      });
  }, []);

  const removeFromCollection = useCallback((collectionId, resourceId) => {
    return api
      .delete(`/resources/collections/${collectionId}/resources/${resourceId}`)
      .then(({ data }) => {
        setCollections(data.collections || []);
      });
  }, []);

  const deleteCollection = useCallback((collectionId) => {
    return api.delete(`/resources/collections/${collectionId}`).then(() => {
      setCollections((prev) => prev.filter((collection) => collection.id !== collectionId));
    });
  }, []);

  const addReview = useCallback((resourceId, review) => {
    return api.post(`/resources/${resourceId}/reviews`, review).then(({ data }) => {
      const updated = normalizeResource(data.resource);
      setAllResources((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setReviewsByResource((prev) => ({ ...prev, [resourceId]: updated.reviews || [] }));
      setCommentsByResource((prev) => ({ ...prev, [resourceId]: updated.comments || [] }));
      return updated;
    });
  }, []);

  const addComment = useCallback((resourceId, message) => {
    return api.post(`/resources/${resourceId}/comments`, { message }).then(({ data }) => {
      setCommentsByResource((prev) => ({ ...prev, [resourceId]: data.comments || [] }));
      return data.comments || [];
    });
  }, []);

  const addCommentReply = useCallback((resourceId, commentId, message) => {
    return api
      .post(`/resources/${resourceId}/comments/${commentId}/replies`, { message })
      .then(({ data }) => {
        setCommentsByResource((prev) => ({ ...prev, [resourceId]: data.comments || [] }));
        return data.comments || [];
      });
  }, []);

  const registerDownload = useCallback(
    (resourceId) => {
      return api.post(`/resources/${resourceId}/download`).then(({ data }) => {
        const updated = normalizeResource(data.resource);
        setAllResources((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        syncReviewMap([updated]);
        syncCommentMap([updated]);
        return updated;
      });
    },
    [syncCommentMap, syncReviewMap]
  );

  const updateResourceStatus = useCallback(async (id, status, rejectionReason = '') => {
    const { data } = await api.patch(`/admin/resources/${id}/status`, {
      status,
      rejectionReason,
    });

    const updated = normalizeResource(data.resource);
    setAllResources((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setMyUploads((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    syncReviewMap([updated]);
    syncCommentMap([updated]);
    return updated;
  }, [syncCommentMap, syncReviewMap]);

  const addModerationNote = useCallback(async (resourceId, note) => {
    const { data } = await api.post(`/admin/resources/${resourceId}/notes`, { note });
    const updated = normalizeResource(data.resource);
    setAllResources((prev) => {
      const exists = prev.some((item) => item.id === updated.id);
      return exists
        ? prev.map((item) => (item.id === updated.id ? updated : item))
        : [updated, ...prev];
    });
    setMyUploads((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    syncReviewMap([updated]);
    syncCommentMap([updated]);
    return updated;
  }, [syncCommentMap, syncReviewMap]);

  const updateResource = useCallback(async (resourceId, payload) => {
    const { data } = await api.patch(`/resources/${resourceId}`, payload);
    const updated = normalizeResource(data.resource);
    setAllResources((prev) => {
      const exists = prev.some((item) => item.id === updated.id);
      return exists
        ? prev.map((item) => (item.id === updated.id ? updated : item))
        : [updated, ...prev];
    });
    setMyUploads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    syncReviewMap([updated]);
    syncCommentMap([updated]);
    return updated;
  }, [syncCommentMap, syncReviewMap]);

  const deleteResource = useCallback(async (resourceId) => {
    await api.delete(`/resources/${resourceId}`);
    setAllResources((prev) => prev.filter((item) => item.id !== resourceId));
    setMyUploads((prev) => prev.filter((item) => item.id !== resourceId));
    setBookmarkedResources((prev) => prev.filter((item) => item.id !== resourceId));
    setCollections((prev) =>
      prev.map((collection) => ({
        ...collection,
        resourceIds: (collection.resourceIds || []).filter((id) => id !== resourceId),
        resources: (collection.resources || []).filter((resource) => resource.id !== resourceId),
      }))
    );
  }, []);

  const moderationBuckets = useMemo(
    () => ({
      pending: allResources.filter((resource) => resource.status === 'pending'),
      approved: allResources.filter((resource) => resource.status === 'approved'),
      rejected: allResources.filter((resource) => resource.status === 'rejected'),
    }),
    [allResources]
  );

  const resources = useMemo(() => {
    return allResources
      .filter((resource) => {
        if (filters.status !== 'all' && resource.status !== filters.status) return false;
        if (filters.type !== 'all' && resource.type !== filters.type) return false;
        if (filters.category !== 'all' && resource.category !== filters.category) return false;
        if (filters.rating > 0 && (resource.rating || 0) < filters.rating) return false;

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const searchableText = [
            resource.title,
            resource.description,
            resource.category,
            resource.uploadedBy?.name,
            ...(resource.tags || []),
          ]
            .join(' ')
            .toLowerCase();

          if (!searchableText.includes(searchLower)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
          case 'popular':
            return (b.downloads || 0) - (a.downloads || 0);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
          default:
            return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
        }
      });
  }, [allResources, filters]);

  const collectionsWithResources = useMemo(() => collections, [collections]);

  const resourcesWithReviews = useMemo(
    () =>
    allResources.map((resource) => {
        const resourceReviews = reviewsByResource[resource.id] || resource.reviews || [];
        const reviewCount = resourceReviews.length || resource.reviewCount || 0;
        const rating = resourceReviews.length
          ? resourceReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / resourceReviews.length
          : resource.rating || 0;

        return {
          ...resource,
          rating,
          reviewCount,
        };
      }),
    [allResources, reviewsByResource]
  );

  const value = {
    resources: resources.map((resource) => {
      const reviewed = resourcesWithReviews.find((item) => item.id === resource.id);
      return reviewed || resource;
    }),
    allResources,
    myUploads,
    resourcesWithReviews,
    loading,
    error,
    filters,
    setFilters,
    fetchResources,
    getResourceById,
    uploadResource,
    fetchMyUploads,
    updateResource,
    deleteResource,
    updateResourceStatus,
    approveResource: (id) => updateResourceStatus(id, 'approved'),
    rejectResource: (id, reason = '') => updateResourceStatus(id, 'rejected', reason),
    pendingResources: moderationBuckets.pending,
    approvedResources: moderationBuckets.approved,
    rejectedResources: moderationBuckets.rejected,
    bookmarkedResources,
    toggleBookmark,
    isBookmarked: (resourceId) => bookmarkedResources.some((resource) => resource.id === resourceId),
    collections: collectionsWithResources,
    createCollection,
    updateCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
    reviewsByResource,
    getResourceReviews: (resourceId) => reviewsByResource[resourceId] || [],
    addReview,
    commentsByResource,
    getResourceComments: (resourceId) => commentsByResource[resourceId] || [],
    addComment,
    addCommentReply,
    registerDownload,
    addModerationNote,
    refreshPersonalResources: fetchPersonalResourceData,
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};

export default ResourceContext;
