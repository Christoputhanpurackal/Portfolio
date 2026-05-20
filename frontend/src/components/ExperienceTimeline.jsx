import { motion } from 'framer-motion';
import { Briefcase, GraduationCap } from 'lucide-react';

const experiences = [
  {
    title: "Junior AI Engineer",
    company: "Urbanex Analytics Pvt Ltd",
    type: "work",
    current: true,
  },
  {
    title: "Python Developer Internship",
    company: "Wistora IQ Solutions",
    type: "work",
    duration: "3 Months",
  },
  {
    title: "Data Science and AI Internship",
    company: "IPSR Solutions Ltd",
    type: "work",
    duration: "6 Months",
  },
  {
    title: "Data Science & AI Training",
    company: "IPSR",
    type: "education",
  },
  {
    title: "BTech Computer Science and Technology",
    company: "University",
    type: "education",
  }
];

export default function ExperienceTimeline() {
  return (
    <section id="experience" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Experience & <span className="text-gradient">Education</span></h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        <div className="relative border-l-2 border-white/10 pl-8 ml-4 space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[41px] top-1 bg-darker p-2 rounded-full border border-white/20">
                {exp.type === 'work' ? (
                  <Briefcase className={`w-4 h-4 ${exp.current ? 'text-blue-400' : 'text-gray-400'}`} />
                ) : (
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                )}
              </div>
              
              <div className={`glass-card p-6 ${exp.current ? 'border-primary/50 border' : ''}`}>
                <h3 className="text-xl font-bold text-white mb-1">{exp.title}</h3>
                <p className="text-lg text-gray-400 mb-2">{exp.company}</p>
                {exp.duration && (
                  <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300">
                    {exp.duration}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
