import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../context/Axiosinstance';
import { fetchAdminAnalytics } from '../../context/Analytics.service';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    pendingResources: 0,
    approvedResources: 0,
    totalDownloads: 0,
    activeUsers: 0,
    averageRating: 0,
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeAdminUser = useCallback((user) => ({
    id: user.id,
    name: user.fullName || user.username,
    avatar: (user.fullName || user.username || 'SS').slice(0, 2).toUpperCase(),
    email: user.email,
    role: user.role,
    status: user.isActive ? 'active' : 'inactive',
    joinDate: user.createdAt,
    lastActive: user.createdAt,
    resourcesUploaded: 0,
    points: 0,
  }), []);

  const normalizeAdminResource = useCallback((resource) => ({
    ...resource,
    uploadedAt: resource.uploadedAt || resource.createdAt,
    creator: resource.creator || null,
    uploadedBy: {
      name: resource.uploadedBy?.name || resource.creator?.fullName || resource.creator?.username || 'Unknown',
    },
    versions: resource.versions || [],
    moderationHistory: resource.moderationHistory || [],
    plagiarismMatches: resource.plagiarismMatches || [],
    prerequisites: resource.prerequisites || [],
  }), []);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, usersRes, resourcesRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/resources'),
        fetchAdminAnalytics(),
      ]);

      const dashboardStats = dashboardRes.data.stats || {};
      setStats({
        totalUsers: dashboardStats.totalUsers || 0,
        totalResources: dashboardStats.totalResources || 0,
        pendingResources: dashboardStats.pendingResources || 0,
        approvedResources: dashboardStats.approvedResources || 0,
        totalDownloads: dashboardStats.totalDownloads || 0,
        activeUsers: dashboardStats.activeUsers || (usersRes.data.users || []).filter((user) => user.isActive).length,
        averageRating: dashboardStats.averageRating || 0,
        monthlyGrowth: dashboardStats.monthlyGrowth || 0,
      });
      setUsers((usersRes.data.users || []).map(normalizeAdminUser));
      setResources((resourcesRes.data.resources || []).map(normalizeAdminResource));
      setAnalytics(analyticsRes || null);
      setActivities([
        ...(resourcesRes.data.resources || []).slice(0, 5).map((resource) => ({
          id: `resource-${resource.id}`,
          action: resource.status === 'approved' ? 'approved' : resource.status === 'rejected' ? 'rejected' : 'uploaded',
          target: resource.title,
          timestamp: resource.updatedAt || resource.createdAt || new Date().toISOString(),
          user: {
            name: resource.creator?.fullName || resource.creator?.username || 'Unknown',
            avatar: (resource.creator?.fullName || resource.creator?.username || 'UN').slice(0, 2).toUpperCase(),
          },
        })),
        ...(usersRes.data.users || []).slice(0, 5).map((user) => ({
          id: `user-${user.id}`,
          action: 'joined',
          target: 'StudySphere',
          timestamp: user.createdAt || new Date().toISOString(),
          user: {
            name: user.fullName || user.username || 'Unknown',
            avatar: (user.fullName || user.username || 'UN').slice(0, 2).toUpperCase(),
          },
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin data.');
      setActivities([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [normalizeAdminResource, normalizeAdminUser]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const approveResource = useCallback(async (id) => {
    const { data } = await api.patch(`/admin/resources/${id}/status`, { status: 'approved' });
    const normalized = normalizeAdminResource(data.resource);
    setSelectedResource((prev) => (prev?.id === normalized.id ? normalized : prev));
    setResources((prev) => prev.map((item) => (item.id === normalized.id ? normalized : item)));
    await fetchAdminData();
  }, [fetchAdminData, normalizeAdminResource]);

  const rejectResource = useCallback(async (id, reason = '') => {
    const { data } = await api.patch(`/admin/resources/${id}/status`, { status: 'rejected', rejectionReason: reason });
    const normalized = normalizeAdminResource(data.resource);
    setSelectedResource((prev) => (prev?.id === normalized.id ? normalized : prev));
    setResources((prev) => prev.map((item) => (item.id === normalized.id ? normalized : item)));
    await fetchAdminData();
  }, [fetchAdminData, normalizeAdminResource]);

  const fetchResourceDetail = useCallback(async (id) => {
    const { data } = await api.get(`/admin/resources/${id}`);
    const normalized = normalizeAdminResource(data.resource);
    setSelectedResource(normalized);
    setResources((prev) => prev.map((item) => (item.id === normalized.id ? normalized : item)));
    return normalized;
  }, [normalizeAdminResource]);

  const addModerationNote = useCallback(async (id, note) => {
    const { data } = await api.post(`/admin/resources/${id}/notes`, { note });
    const normalized = normalizeAdminResource(data.resource);
    setSelectedResource(normalized);
    setResources((prev) => prev.map((item) => (item.id === normalized.id ? normalized : item)));
    return normalized;
  }, [normalizeAdminResource]);

  const updateUserRole = useCallback(async (id, newRole) => {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role: newRole });
    setUsers((prev) => prev.map((item) => (item.id === data.user.id ? normalizeAdminUser(data.user) : item)));
    await fetchAdminData();
  }, [fetchAdminData, normalizeAdminUser]);

  const updateUserStatus = useCallback(async (id, statusOrActive) => {
    const isActive = typeof statusOrActive === 'string' ? statusOrActive === 'active' : Boolean(statusOrActive);
    const { data } = await api.patch(`/admin/users/${id}/status`, { isActive });
    setUsers((prev) => prev.map((item) => (item.id === data.user.id ? normalizeAdminUser(data.user) : item)));
    await fetchAdminData();
  }, [fetchAdminData, normalizeAdminUser]);

  return (
    <AdminContext.Provider value={{ users, resources, activities, analytics, stats, loading, error, selectedResource, fetchAdminData, approveResource, rejectResource, updateUserRole, updateUserStatus, fetchResourceDetail, addModerationNote }}>
      {children}
    </AdminContext.Provider>
  );
};
