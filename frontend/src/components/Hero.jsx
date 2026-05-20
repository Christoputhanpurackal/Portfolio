import { motion } from 'framer-motion';
import { ArrowRight, Download, Mail } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <motion.div 
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xl md:text-2xl font-medium text-blue-400 mb-2">Hello, I'm</h2>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              Christo Puthanpurackal
            </h1>
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-6">
              Junior AI Engineer | Data Science | ML Developer
            </h3>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
              Building intelligent solutions through AI, Machine Learning, and modern technologies.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href="#projects" className="px-8 py-3 rounded-full bg-primary hover:bg-blue-600 text-white font-medium flex items-center transition-colors">
                View Projects <ArrowRight className="ml-2 w-4 h-4" />
              </a>
              <a href="http://localhost:8000/download-cv" target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-full glass hover:bg-white/10 font-medium flex items-center transition-colors">
                Download Resume <Download className="ml-2 w-4 h-4" />
              </a>
              <a href="#contact" className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5 font-medium flex items-center transition-colors">
                Contact Me <Mail className="ml-2 w-4 h-4" />
              </a>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full p-2 glass">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/10 relative">
                <img 
                  src={imgError ? "https://ui-avatars.com/api/?name=Christo+Puthanpurackal&size=512&background=0D8ABC&color=fff" : "http://localhost:8000/static/profile.jpg"} 
                  alt="Christo Puthanpurackal" 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-darker/80 to-transparent"></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
