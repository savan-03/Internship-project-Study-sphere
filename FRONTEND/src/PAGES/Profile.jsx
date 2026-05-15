// src/PAGES/UserProfilePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // User data (would come from backend/localStorage)
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    username: '@johndoe',
    avatar: 'JD',
    bio: 'Full-stack developer passionate about DSA and AI/ML',
    location: 'San Francisco, CA',
    joinDate: 'January 2025',
    skills: ['JavaScript', 'React', 'Python', 'DSA', 'System Design'],
    interests: ['Web Development', 'AI/ML', 'Open Source']
  });

  // Stats
  const stats = [
    { label: 'Problems Solved', value: '87', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { label: 'Resources', value: '12', icon: '📚', color: 'from-green-500 to-emerald-500' },
    { label: 'Study Groups', value: '4', icon: '👥', color: 'from-purple-500 to-pink-500' },
    { label: 'Badges', value: '8', icon: '🏆', color: 'from-yellow-500 to-orange-500' }
  ];

  // Uploaded resources
  const [uploadedResources, setUploadedResources] = useState([
    { id: 1, title: 'DSA Handbook', type: 'pdf', status: 'approved', uploadDate: '2025-03-15', views: 234, downloads: 45 },
    { id: 2, title: 'Python Tutorial', type: 'video', status: 'pending', uploadDate: '2025-03-20', views: 0, downloads: 0 },
    { id: 3, title: 'System Design Notes', type: 'notes', status: 'approved', uploadDate: '2025-03-10', views: 567, downloads: 89 }
  ]);

  // Achievements
  const achievements = [
    { id: 1, title: '100-Day Streak', icon: '🔥', date: 'Feb 2026' },
    { id: 2, title: 'DSA Master', icon: '💻', date: 'Jan 2026' },
    { id: 3, title: 'Top Contributor', icon: '🏅', date: 'Dec 2025' },
    { id: 4, title: 'Quiz Champion', icon: '🧠', date: 'Nov 2025' }
  ];

  // Recent activity
  const activities = [
    { id: 1, action: 'Solved "Two Sum" problem', time: '2 hours ago', icon: '💻' },
    { id: 2, action: 'Uploaded "Python Tutorial"', time: '1 day ago', icon: '📤' },
    { id: 3, action: 'Completed AI Quiz', time: '2 days ago', icon: '🧠' },
    { id: 4, action: 'Earned "50 Problems" Badge', time: '3 days ago', icon: '🏆' }
  ];

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'pdf',
    tags: '',
    file: null
  });

  const handleUpload = (e) => {
    e.preventDefault();
    const newResource = {
      id: uploadedResources.length + 1,
      title: uploadForm.title,
      type: uploadForm.type,
      status: 'pending',
      uploadDate: new Date().toISOString().split('T')[0],
      views: 0,
      downloads: 0
    };
    setUploadedResources([newResource, ...uploadedResources]);
    setShowUploadModal(false);
    setUploadForm({ title: '', description: '', type: 'pdf', tags: '', file: null });
    alert('Resource uploaded successfully! Waiting for approval.');
  };

  const handleEditSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const getTypeIcon = (type) => {
    const icons = { pdf: '📄', video: '🎥', blog: '📝', notes: '📓' };
    return icons[type] || '📚';
  };

  const getStatusColor = (status) => {
    const colors = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Upload Resource</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <input type="text" placeholder="Title" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" required />
              <textarea placeholder="Description" rows="3" value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" required />
              <select value={uploadForm.type} onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="blog">Blog</option>
                <option value="notes">Notes</option>
              </select>
              <input type="text" placeholder="Tags (comma separated)" value={uploadForm.tags} onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
              <input type="file" onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})} className="w-full" required />
              <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Upload</button>
            </form>
          </div>
        </div>
      )}

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">
                  {userData.avatar}
                </div>
                <div>
                  {isEditing ? (
                    <input value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1 text-white" />
                  ) : (
                    <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
                  )}
                  <p className="text-purple-200">{userData.username}</p>
                  <p className="text-purple-200 text-sm">{userData.email}</p>
                </div>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100">+ Upload</button>
                <button onClick={() => isEditing ? handleEditSave() : setIsEditing(true)} className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
                  {isEditing ? 'Save' : 'Edit Profile'}
                </button>
              </div>
            </div>
            {isEditing ? (
              <textarea value={userData.bio} onChange={(e) => setUserData({...userData, bio: e.target.value})} className="mt-4 w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50" rows="2" />
            ) : (
              <p className="mt-4 text-purple-100">{userData.bio}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap gap-4">
            {['overview', 'resources', 'achievements', 'activity'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 px-1 capitalize font-medium ${activeTab === tab ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">About</h3>
                  <p className="text-gray-600 dark:text-gray-300">{userData.bio || 'No bio added yet'}</p>
                  <p className="text-gray-500 text-sm mt-2">📍 {userData.location} • Joined {userData.joinDate}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map(skill => <span key={skill} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">{skill}</span>)}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mt-4 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map(interest => <span key={interest} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">{interest}</span>)}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {stats.map(stat => (
                  <div key={stat.label} className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-white`}>
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">My Uploads</h3>
                <button onClick={() => setShowUploadModal(true)} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">+ New</button>
              </div>
              <div className="space-y-3">
                {uploadedResources.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(res.type)}</span>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{res.title}</h4>
                        <p className="text-xs text-gray-500">Uploaded {res.uploadDate} • {res.views} views • {res.downloads} downloads</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(res.status)}`}>{res.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Badges & Achievements</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {achievements.map(ach => (
                  <div key={ach.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-3xl">{ach.icon}</div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{ach.title}</div>
                      <div className="text-xs text-gray-500">Earned {ach.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activities.map(act => (
                  <div key={act.id} className="flex items-center space-x-3 p-3 border-b last:border-0">
                    <span className="text-2xl">{act.icon}</span>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-white">{act.action}</p>
                      <p className="text-xs text-gray-500">{act.time}</p>
                    </div>
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

export default UserProfilePage;