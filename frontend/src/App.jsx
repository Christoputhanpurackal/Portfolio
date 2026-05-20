import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import ExperienceTimeline from './components/ExperienceTimeline';
import Projects from './components/Projects';
import Certificates from './components/Certificates';
import AIAssistant from './components/AIAssistant';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="bg-darker text-gray-100 font-sans antialiased selection:bg-primary selection:text-white">
      <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />
      <main>
        <Hero />
        <About />
        <Skills />
        <ExperienceTimeline />
        <Projects />
        <Certificates />
        <Contact />
      </main>
      <AIAssistant />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default App;
