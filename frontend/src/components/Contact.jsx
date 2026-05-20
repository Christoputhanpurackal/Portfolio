import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Contact() {
  return (
    <section id="contact" className="py-20 relative bg-black/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Get In <span className="text-gradient">Touch</span></h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-400">
            I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.a 
            href="mailto:christoputhan18@gmail.com"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="glass-card p-8 flex flex-col items-center justify-center text-center group"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/40 transition-colors">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <p className="text-gray-400">christoputhan18@gmail.com</p>
          </motion.a>

          <motion.a 
            href="tel:7902661908"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="glass-card p-8 flex flex-col items-center justify-center text-center group"
          >
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500/40 transition-colors">
              <Phone className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Phone</h3>
            <p className="text-gray-400">7902661908</p>
          </motion.a>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center space-x-6"
        >
          <a href="https://github.com/Christoputhanpurackal" target="_blank" rel="noopener noreferrer" className="p-4 glass rounded-full hover:bg-white/10 transition-colors group">
            <FaGithub className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </a>
          <a href="https://www.linkedin.com/in/christo-puthanpurackal/" target="_blank" rel="noopener noreferrer" className="p-4 glass rounded-full hover:bg-blue-500/20 transition-colors group">
            <FaLinkedin className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
          </a>
          <a href="https://www.instagram.com/chrizzz_908/" target="_blank" rel="noopener noreferrer" className="p-4 glass rounded-full hover:bg-pink-500/20 transition-colors group">
            <FaInstagram className="w-6 h-6 text-gray-400 group-hover:text-pink-500" />
          </a>
        </motion.div>
      </div>
      
      {/* Footer */}
      <div className="mt-20 border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
        <p>Designed & Built with React, Tailwind CSS, and Framer Motion</p>
        <p className="mt-2">© {new Date().getFullYear()} Christo Puthanpurackal</p>
      </div>
    </section>
  );
}
