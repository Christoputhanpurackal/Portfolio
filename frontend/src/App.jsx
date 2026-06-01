import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import ProtectedRoute from './components/ProtectedRoute';
import Portfolio from './pages/Portfolio';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import VisitorManagement from './pages/admin/VisitorManagement';
import ProfileManagement from './pages/admin/ProfileManagement';
import CVManagement from './pages/admin/CVManagement';
import CertificateManagement from './pages/admin/CertificateManagement';
import ProjectManagement from './pages/admin/ProjectManagement';

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="visitors" element={<VisitorManagement />} />
            <Route path="profile" element={<ProfileManagement />} />
            <Route path="cv" element={<CVManagement />} />
            <Route path="certificates" element={<CertificateManagement />} />
            <Route path="projects" element={<ProjectManagement />} />
          </Route>
        </Routes>
      </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;
