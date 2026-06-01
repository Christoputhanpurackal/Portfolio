import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [data, setData] = useState({
    profile: null,
    projects: [],
    certificates: [],
    loading: true
  });
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, projectsRes, certsRes] = await Promise.all([
          axios.get('/profile'),
          axios.get('/projects'),
          axios.get('/certificates')
        ]);
        // Additional projects to include (linked to GitHub repos)
        const additionalProjects = [
          {
            id: `ext-1`,
            title: 'YOLOv8 Object Detection using OpenCV',
            tech: 'YOLOv8, OpenCV, Python',
            description: 'Real-time object detection demo using YOLOv8 and OpenCV for video streams.',
            link: 'https://github.com/Christoputhanpurackal/YOLOv8-Object-Detection-using-OpenCV',
            active: true
          },
          {
            id: `ext-2`,
            title: 'Medical drugs - RAG',
            tech: 'RAG, Retrieval-Augmented Generation, NLP',
            description: 'A medical drugs retrieval assistant built using RAG for domain-specific Q&A.',
            link: 'https://github.com/Christoputhanpurackal/Medical-drugs--RAG',
            active: true
          },
          {
            id: `ext-3`,
            title: 'AI Face Recognition System',
            tech: 'Face Recognition, OpenCV, Deep Learning',
            description: 'Face recognition pipeline with training and real-time inference.',
            link: 'https://github.com/Christoputhanpurackal/ai-face-recognition-system',
            active: true
          },
          {
            id: `ext-4`,
            title: 'RAG Llama3 ML Interview',
            tech: 'Llama3, RAG, Interview Prep',
            description: 'An interview preparation assistant using Llama3 and retrieval-augmented generation.',
            link: 'https://github.com/Christoputhanpurackal/rag-llama3-ml-interview',
            active: true
          },
          {
            id: `ext-5`,
            title: 'Medical AI Assistant - MiniGPT Transformer',
            tech: 'MiniGPT, Transformers, Medical AI',
            description: 'A compact MiniGPT-based medical AI assistant for domain Q&A and support.',
            link: 'https://github.com/Christoputhanpurackal/Medical-AI-Assistant-MiniGPT-Transformer-',
            active: true
          }
        ];

        // Merge backend projects with additional ones (avoid duplicates by title)
        const backendProjects = projectsRes.data || [];
        const merged = [...backendProjects];
        additionalProjects.forEach((ap) => {
          if (!merged.some(p => (p.title || '').toLowerCase() === (ap.title || '').toLowerCase())) {
            merged.push(ap);
          }
        });

        setData({
          profile: profileRes.data,
          projects: merged,
          certificates: certsRes.data.certificates || [],
          loading: false
        });
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [refreshTrigger]);

  return (
    <PortfolioContext.Provider value={{ data, refreshData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
