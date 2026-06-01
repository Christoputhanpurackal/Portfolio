import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import ExperienceTimeline from '../components/ExperienceTimeline';
import Projects from '../components/Projects';
import Certificates from '../components/Certificates';
import AIAssistant from '../components/AIAssistant';
import Contact from '../components/Contact';
import { trackVisitor } from '../utils/visitorTracker';

export default function Portfolio() {
  useEffect(() => {
    trackVisitor();
  }, []);

  return (
    <div className="bg-darker text-gray-100 font-sans antialiased selection:bg-primary selection:text-white">
      <Navbar />
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
    </div>
  );
}
