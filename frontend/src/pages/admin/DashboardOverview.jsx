import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FolderGit2, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    todaysVisitors: 0,
    totalProjects: 0,
    totalCertificates: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, projectsRes, certsRes] = await Promise.all([
          axios.get('/analytics'),
          axios.get('/projects'),
          axios.get('/certificates')
        ]);
        
        setStats({
          totalVisitors: analyticsRes.data.total_visitors || 0,
          todaysVisitors: analyticsRes.data.todays_visitors || 0,
          totalProjects: projectsRes.data.length || 0,
          totalCertificates: certsRes.data.certificates ? certsRes.data.certificates.length : 0
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    };
    fetchAnalytics();
  }, []);

  const cards = [
    { title: 'Total Visitors', value: stats.totalVisitors, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { title: 'Today\'s Visits', value: stats.todaysVisitors, icon: Activity, color: 'text-green-400', bg: 'bg-green-400/20' },
    { title: 'Total Projects', value: stats.totalProjects, icon: FolderGit2, color: 'text-purple-400', bg: 'bg-purple-400/20' },
    { title: 'Certificates', value: stats.totalCertificates, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back, Christo. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={card.title}
              className="glass p-6 rounded-2xl border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{card.value}</h3>
                </div>
                <div className={`p-4 rounded-xl ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Chart placeholder or recent activity could go here */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass p-8 rounded-2xl border border-white/10 mt-8"
      >
         <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
         <p className="text-gray-400">Activity stream will appear here.</p>
      </motion.div>
    </div>
  );
}
