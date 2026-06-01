import { motion } from 'framer-motion';
import { FolderGit2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Projects() {
  const { data } = usePortfolio();
  const { projects } = data;

  const activeProjects = projects.filter(p => p.active);

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

        {activeProjects.length === 0 ? (
          <div className="text-center text-gray-400">No projects to display yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProjects.map((project, index) => (
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
                    <FolderGit2 className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    {project.tech}
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
