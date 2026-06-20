import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Breathe from './pages/Breathe';
import AIChat from './pages/AIChat';
import Community from './pages/Community';
import Resources from './pages/Resources';
import Wellness from './pages/Wellness';
import Profile from './pages/Profile';
import Crisis from './pages/Crisis';
import Appointments from './pages/Appointments';
import RoutinePlanner from './pages/RoutinePlanner';
import Recommendations from './pages/Recommendations';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import StressPredictor from './pages/StressPredictor';
import VoiceMood from './pages/VoiceMood';
import AdminDashboard from './pages/AdminDashboard';
import Gamification from './pages/Gamification';
import PeerChat from './pages/PeerChat';
import EmotionDetector from './pages/EmotionDetector';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
        <p className="text-purple-300 font-display text-sm tracking-widest uppercase animate-pulse">Loading MindBridge...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#13131f',
            color: '#f0f0ff',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '12px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px'
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0a0a14' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#0a0a14' } }
        }}
      />
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          {/* Core */}
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/mood"            element={<MoodTracker />} />
          <Route path="/journal"         element={<Journal />} />
          <Route path="/breathe"         element={<Breathe />} />
          <Route path="/chat"            element={<AIChat />} />
          <Route path="/community"       element={<Community />} />
          <Route path="/resources"       element={<Resources />} />
          <Route path="/wellness"        element={<Wellness />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/crisis"          element={<Crisis />} />
          {/* New v2 features */}
          <Route path="/analytics"       element={<Analytics />} />
          <Route path="/appointments"    element={<Appointments />} />
          <Route path="/routine"         element={<RoutinePlanner />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/notifications"   element={<Notifications />} />
          <Route path="/stress"          element={<StressPredictor />} />
          <Route path="/voice"           element={<VoiceMood />} />
          <Route path="/admin"           element={<AdminDashboard />} />
          {/* New v3 features */}
          <Route path="/gamification"    element={<Gamification />} />
          <Route path="/peer-chat"       element={<PeerChat />} />
          <Route path="/emotion"         element={<EmotionDetector />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
