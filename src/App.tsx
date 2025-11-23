import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Network from './pages/Network';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForBrands from './pages/ForBrands';
import ForCreatorsPage from './pages/ForCreatorsPage';
import NewBrief from './pages/NewBrief';
import Pricing from './pages/Pricing';
import CaseStudies from './pages/CaseStudies';
import AccountSettings from './pages/AccountSettings';
import Onboarding from './pages/Onboarding';
import FanOnboarding from './pages/FanOnboarding';
import Dashboard from './pages/Dashboard';
import Monetization from './pages/Monetization';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCreators from './pages/admin/AdminCreators';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import CreatorProfile from './pages/CreatorProfile';

function App() {
  const location = useLocation();
  const isCreatorProfilePage = location.pathname.startsWith('/creator/');

  return (
    <div className="min-h-screen bg-white">
      {!isCreatorProfilePage && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/network" element={<Network />} />
        <Route path="/creator/:handle" element={<CreatorProfile />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/monetization"
          element={
            <ProtectedRoute>
              <Monetization />
            </ProtectedRoute>
          }
        />

        <Route path="/brands" element={<ForBrands />} />
        <Route path="/creators" element={<ForCreatorsPage />} />
        <Route path="/briefs/new" element={<NewBrief />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/case-studies" element={<CaseStudies />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/fan"
          element={
            <ProtectedRoute>
              <FanOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account/settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/creators"
          element={
            <AdminRoute>
              <AdminCreators />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <AdminRoute>
              <AdminVerifications />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />
      </Routes>

      {!isCreatorProfilePage && <Footer />}
    </div>
  );
}

export default App;
