import { useState, useEffect } from 'react';
import { Upload, Save, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { usePortfolio } from '../../context/PortfolioContext';

export default function ProfileManagement() {
  const { data, refreshData } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: '', title: '', about: '', email: '', github: '', linkedin: ''
  });

  useEffect(() => {
    if (data.profile) {
      setFormData(data.profile);
    }
  }, [data.profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/profile', formData);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      refreshData();
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update profile.' });
    }
    setLoading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleUploadProfilePic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      await axios.post(`/upload/profile`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'Profile picture uploaded!' });
      refreshData();
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to upload profile picture.' });
    }
    setLoading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile Management</h1>
        <p className="text-gray-400 mt-2">Update your personal details and about section.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center border ${status.type === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-white/10 border-4 border-white/5 overflow-hidden mb-4 relative group">
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleUploadProfilePic} disabled={loading} />
              <img src={`${API_BASE_URL}/static/profile.jpg?t=${new Date().getTime()}`} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
            </div>
            <h3 className="text-lg font-bold text-white">{formData.name}</h3>
            <p className="text-primary">{formData.title}</p>
          </div>
        </div>

        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">About</label>
              <textarea name="about" value={formData.about} onChange={handleChange} rows="4" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">GitHub URL</label>
                <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl transition-colors font-medium">
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
