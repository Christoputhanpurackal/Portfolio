import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';

export default function About() {
  const { data } = usePortfolio();
  const { profile } = data;

  if (!profile) return null;

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">About <span className="text-gradient">Me</span></h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-8"
          >
            <p className="text-lg text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
              {profile.about}
            </p>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <h4 className="text-xl font-semibold mb-2 text-blue-400">Current Role</h4>
              <p className="text-white">{profile.title}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="glass-card p-6 text-center">
              <h3 className="text-4xl font-bold text-primary mb-2">6+</h3>
              <p className="text-gray-400">Months Intern at IPSR</p>
            </div>
            <div className="glass-card p-6 text-center">
              <h3 className="text-4xl font-bold text-purple-400 mb-2">3+</h3>
              <p className="text-gray-400">Months Intern at Wistora</p>
            </div>
            <div className="glass-card p-6 text-center col-span-2">
              <h3 className="text-2xl font-bold text-white mb-2">Constant Learner</h3>
              <p className="text-gray-400">Passionate about NLP, RAG, and Modern AI</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
