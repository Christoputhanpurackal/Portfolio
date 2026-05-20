import { motion } from 'framer-motion';
import { Terminal, Brain, Layers, Wrench } from 'lucide-react';

const skillCategories = [
  {
    title: "Programming",
    icon: <Terminal className="w-6 h-6 text-blue-400" />,
    skills: ["Python", "SQL", "Java"]
  },
  {
    title: "AI / ML",
    icon: <Brain className="w-6 h-6 text-purple-400" />,
    skills: ["Machine Learning", "Deep Learning", "NLP", "RAG", "FAISS", "LangChain"]
  },
  {
    title: "Libraries & Frameworks",
    icon: <Layers className="w-6 h-6 text-green-400" />,
    skills: ["Pandas", "NumPy", "Django", "Flask", "FastAPI", "Matplotlib", "Seaborn"]
  },
  {
    title: "Tools & Analytics",
    icon: <Wrench className="w-6 h-6 text-orange-400" />,
    skills: ["PowerBI", "Exploratory Data Analysis (EDA)", "Git", "VS Code"]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="py-20 relative bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Technical <span className="text-gradient">Skills</span></h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-white/5 rounded-lg mr-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
