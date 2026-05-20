import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, GitFork } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import axios from 'axios';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://api.github.com/users/Christoputhanpurackal/repos?per_page=100');
        const targetRepos = [
          'ai-face-recognition-system',
          'image-to-text-generation',
          'rag-llama3-ml-interview',
          'Medical-drugs--RAG'
        ];
        
        const filteredProjects = response.data.filter(repo => 
          targetRepos.includes(repo.name)
        );
        
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-20 relative bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured <span className="text-gradient">Projects</span></h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card flex flex-col h-full overflow-hidden group"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <FaGithub className="w-8 h-8 text-blue-400" />
                    <div className="flex space-x-3">
                      <a href={project.html_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {project.description || "No description provided for this repository."}
                  </p>
                  
                  {project.language && (
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      {project.language}
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center"><Star className="w-4 h-4 mr-1" /> {project.stargazers_count}</span>
                    <span className="flex items-center"><GitFork className="w-4 h-4 mr-1" /> {project.forks_count}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
