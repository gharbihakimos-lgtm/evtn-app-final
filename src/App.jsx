import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import StationDetail from './components/StationDetail';
import StationForm from './components/StationForm';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import AdminPage from './components/AdminPage';

function App() {
  const [showStationForm, setShowStationForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentView, setCurrentView] = useState('app'); // 'app' or 'admin'
  const { isAuthenticated } = useAuth();

  const handleAddStation = () => {
    if (isAuthenticated) {
      setShowStationForm(true);
    } else {
      setShowAuthModal(true);
    }
  };

  if (currentView === 'admin') {
    return <AdminPage onExit={() => setCurrentView('app')} />;
  }

  return (
    <div className="app">
      <Navbar
        onOpenStationForm={handleAddStation}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfile(true)}
        onOpenAdmin={() => setCurrentView('admin')}
      />
      <FilterBar />
      <div className="app-container">
        <Sidebar />
        <MapView />
      </div>

      <StationDetail />

      <StationForm
        isOpen={showStationForm}
        onClose={() => setShowStationForm(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <UserProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
}

export default App;
