import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AdminPanel({ isOpen, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await axios.post('http://localhost:8000/admin/login', { username, password });
      setToken(res.data.token);
      setIsAuthenticated(true);
    } catch (err) {
      setStatus({ type: 'error', message: 'Invalid credentials' });
    }
    setLoading(false);
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file); // Though backend reads raw body, we will just send raw body or we need to change it.
    // Wait, the backend reads raw body `await request.body()`. We should send it directly.
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type,
      };
      
      if (type === 'certificate') {
        headers['X-Filename'] = file.name;
      }

      await axios.post(`http://localhost:8000/upload/${type}`, file, { headers });
      setStatus({ type: 'success', message: `${type} uploaded successfully!` });
      
      // Reload page to reflect changes if it's profile or CV
      if (type === 'profile') {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setStatus({ type: 'error', message: `Failed to upload ${type}` });
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass border border-white/20 rounded-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Admin Access</h2>
            <p className="text-gray-400 text-sm mt-2">Upload Profile Picture, CV, and Certificates.</p>
          </div>

          {status && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 text-sm mb-6 ${status.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {status.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{status.message}</span>
            </div>
          )}

          {!isAuthenticated ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-600 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-primary transition-colors">Profile Picture</h4>
                    <p className="text-xs text-gray-500">Upload a new image (.jpg/.png)</p>
                  </div>
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-primary/20 text-gray-400 group-hover:text-primary transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'profile')} disabled={loading} />
                </label>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-primary transition-colors">Resume / CV</h4>
                    <p className="text-xs text-gray-500">Upload your latest PDF CV</p>
                  </div>
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-primary/20 text-gray-400 group-hover:text-primary transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleUpload(e, 'resume')} disabled={loading} />
                </label>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-primary transition-colors">Certificate</h4>
                    <p className="text-xs text-gray-500">Upload a new certificate PDF</p>
                  </div>
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-primary/20 text-gray-400 group-hover:text-primary transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleUpload(e, 'certificate')} disabled={loading} />
                </label>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
