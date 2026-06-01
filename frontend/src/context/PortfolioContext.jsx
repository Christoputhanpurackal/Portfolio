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
        
        setData({
          profile: profileRes.data,
          projects: projectsRes.data,
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
