import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useStations } from './context/StationsContext';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import StationDetail from './components/StationDetail';
import StationForm from './components/StationForm';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import AdminPage from './components/AdminPage';
import LegalModal from './components/LegalModal';
import RoutePlanner from './components/RoutePlanner';
import { Map as MapIcon, List as ListIcon } from 'lucide-react';

function App() {
  const [showStationForm, setShowStationForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [currentView, setCurrentView] = useState('app'); // 'app' or 'admin'
  const [appMode, setAppMode] = useState('map'); // 'map' or 'route'
  const [mobileTab, setMobileTab] = useState('map'); // 'map' or 'list'
  const { isAuthenticated } = useAuth();
  const { filteredStations } = useStations();

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
        appMode={appMode}
        setAppMode={setAppMode}
      />
      <FilterBar />
      <div className={`app-container mobile-view-${mobileTab}`}>
        {appMode === 'map' ? (
          <Sidebar 
            onOpenLegal={() => setShowLegal(true)} 
            onStationSelected={() => setMobileTab('map')}
          />
        ) : (
          <RoutePlanner />
        )}
        <MapView appMode={appMode} />
      </div>

      {/* Floating Mobile Tab Switcher */}
      {appMode === 'map' && (
        <div className="mobile-tab-bar">
          <button 
            className={`mobile-tab-btn ${mobileTab === 'map' ? 'active' : ''}`}
            onClick={() => setMobileTab('map')}
          >
            <MapIcon size={16} />
            <span>Carte</span>
          </button>
          <button 
            className={`mobile-tab-btn ${mobileTab === 'list' ? 'active' : ''}`}
            onClick={() => setMobileTab('list')}
          >
            <ListIcon size={16} />
            <span>Liste ({filteredStations?.length || 0})</span>
          </button>
        </div>
      )}

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

      <LegalModal
        isOpen={showLegal}
        onClose={() => setShowLegal(false)}
      />
    </div>
  );
}

export default App;
