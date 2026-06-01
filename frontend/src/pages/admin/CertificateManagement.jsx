import { useState } from 'react';
import { Upload, Edit2, Trash2, CheckCircle, Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { usePortfolio } from '../../context/PortfolioContext';

export default function CertificateManagement() {
  const { data, refreshData } = usePortfolio();
  const certificates = data.certificates;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      await axios.post(`/upload/certificate`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'Certificate uploaded successfully!' });
      refreshData();
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to upload certificate.' });
    }
    setLoading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDelete = async (filename) => {
    if(window.confirm('Delete this certificate?')) {
      try {
        await axios.delete(`/certificate/${filename}`);
        setStatus({ type: 'success', message: 'Certificate deleted!' });
        refreshData();
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to delete certificate.' });
      }
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Certificates</h1>
          <p className="text-gray-400 mt-2">Manage your certifications and awards.</p>
        </div>
        <label className="flex items-center px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl transition-colors font-medium cursor-pointer">
          <Plus className="w-5 h-5 mr-2" />
          Upload New
          <input type="file" accept="application/pdf,image/*" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center border ${status.type === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="glass p-6 rounded-2xl border border-white/10 group hover:border-primary/50 transition-colors"
          >
            <div className="w-full h-40 bg-white/5 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
               <span className="text-gray-500">PDF Preview</span>
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleDelete(cert)} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors" title="Delete">
                   <Trash2 className="w-5 h-5" />
                 </button>
               </div>
            </div>
            <h3 className="text-lg font-bold text-white truncate" title={cert}>{cert.replace('.pdf', '')}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
