import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('/certificates');
        setCertificates(response.data.certificates || []);
      } catch (error) {
        console.error("Error fetching certificates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <section id="certificates" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">My <span className="text-gradient">Certificates</span></h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center text-gray-500">No certificates uploaded yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card flex flex-col h-full overflow-hidden group p-6 cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setSelectedCert(cert)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400 group-hover:bg-purple-500/40 transition-colors">
                    <Award className="w-8 h-8" />
                  </div>
                  <a 
                    href={`${API_BASE_URL}/certificate/${cert}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                  {cert.replace('.pdf', '')}
                </h3>
                <p className="text-sm text-gray-400 mt-2">Click to view</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Certificate Viewer Modal */}
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-darker rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">
                  {selectedCert.replace('.pdf', '')}
                </h3>
                <button 
                  onClick={() => setSelectedCert(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <iframe 
                  src={`${API_BASE_URL}/certificate/${selectedCert}`}
                  className="w-full h-full"
                  title={selectedCert}
                />
              </div>
              <div className="flex gap-4 p-6 border-t border-white/10">
                <a 
                  href={`${API_BASE_URL}/certificate/${selectedCert}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
