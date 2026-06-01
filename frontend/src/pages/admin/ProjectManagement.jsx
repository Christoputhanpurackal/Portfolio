import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { usePortfolio } from '../../context/PortfolioContext';

export default function ProjectManagement() {
  const { data, refreshData } = usePortfolio();
  const projects = data.projects;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', tech: '', active: true });

  const handleOpenModal = (proj = null) => {
    if (proj) {
      setFormData({ title: proj.title, tech: proj.tech, active: proj.active });
      setEditingId(proj.id);
    } else {
      setFormData({ title: '', tech: '', active: true });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.post(`/projects/${editingId}`, formData);
      } else {
        await axios.post('/projects', formData);
      }
      refreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save project', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this project?')) {
      try {
        await axios.delete(`/projects/${id}`);
        refreshData();
      } catch (err) {
        console.error('Failed to delete project', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-2">Add, edit, or remove your portfolio projects.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Project
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-4 px-6 text-sm font-medium text-gray-400">Project Title</th>
              <th className="py-4 px-6 text-sm font-medium text-gray-400">Technologies</th>
              <th className="py-4 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="py-4 px-6 text-sm font-medium text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-6 font-medium text-white">{proj.title}</td>
                <td className="py-4 px-6 text-gray-400">{proj.tech}</td>
                <td className="py-4 px-6">
                  {proj.active ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium">Inactive</span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => handleOpenModal(proj)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex mr-2">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(proj.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-flex">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass border border-white/20 rounded-2xl overflow-hidden relative p-8"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit Project' : 'New Project'}</h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Technologies</label>
                  <input type="text" value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                </div>
                <button type="submit" className="w-full flex justify-center items-center px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl transition-colors font-medium mt-6">
                  <Save className="w-5 h-5 mr-2" />
                  Save Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
