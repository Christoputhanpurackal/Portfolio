import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { usePortfolio } from '../../context/PortfolioContext';

export default function CVManagement() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const { refreshData } = usePortfolio();
  
  // Cache buster to ensure downloading latest CV
  const cacheBuster = new Date().getTime();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      await axios.post(`/upload/resume`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'CV uploaded successfully!' });
      // Refresh global portfolio data so frontend reflects any changes
      try { refreshData(); } catch (e) { /* ignore */ }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to upload CV.' });
    }
    setLoading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">CV Management</h1>
        <p className="text-gray-400 mt-2">Upload and manage your resume.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center border ${status.type === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          {status.message}
        </div>
      )}

      <div className="glass p-8 rounded-2xl border border-white/10 text-center max-w-2xl mx-auto mt-8">
        <div className="w-20 h-20 mx-auto bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Current Resume</h2>
        <p className="text-gray-400 mb-8">CHRISTO AI.pdf</p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <label className="flex items-center px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl transition-colors font-medium cursor-pointer w-full sm:w-auto justify-center">
            <Upload className="w-5 h-5 mr-2" />
            {loading ? 'Uploading...' : 'Replace CV'}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={loading} />
          </label>
          <a href={`${API_BASE_URL}/download-cv?t=${cacheBuster}`} target="_blank" rel="noopener noreferrer" className="flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-colors font-medium w-full sm:w-auto justify-center">
            <Download className="w-5 h-5 mr-2" />
            Preview / Download
          </a>
        </div>
      </div>
    </div>
  );
}
