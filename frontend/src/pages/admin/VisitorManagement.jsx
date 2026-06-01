import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VisitorManagement() {
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await axios.get('/visitors');
        setVisitors(response.data);
      } catch (err) {
        console.error('Error fetching visitors', err);
      }
    };
    fetchVisitors();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this visitor record?')) {
      try {
        await axios.delete(`/visitors/${id}`);
        setVisitors(visitors.filter(v => v.id !== id));
      } catch (err) {
        console.error('Failed to delete visitor', err);
      }
    }
  };

  const filteredVisitors = visitors.filter(v => 
    (v.browser && v.browser.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.device && v.device.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.ip && v.ip.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Visitor Logs</h1>
          <p className="text-gray-400 mt-2">Track who is visiting your portfolio.</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by IP, Browser, or Device..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="flex items-center px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 text-sm font-medium text-gray-400">Date & Time</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-400">IP Address</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-400">Device</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-400">Browser</th>
                <th className="py-4 px-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((visitor, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={visitor.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-sm text-gray-300">
                    {new Date(visitor.date).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-300">{visitor.ip}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">{visitor.device}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">{visitor.browser}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => handleDelete(visitor.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    No visitor records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
