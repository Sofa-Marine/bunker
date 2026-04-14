import { useState, useCallback } from 'react';
import { ToastProvider } from './hooks/useToast';
import { AuthProvider } from './hooks/useAuth';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';

import HomePage       from './pages/HomePage';
import AuthPage       from './pages/AuthPage';
import LobbyPage      from './pages/LobbyPage';
import RoomWaitingPage from './pages/RoomWaitingPage';
import BriefingPage   from './pages/BriefingPage';
import GamePage       from './pages/GamePage';
import VotingPage     from './pages/VotingPage';
import TestPage       from './pages/TestPage';
import EditorPage     from './pages/EditorPage';
import ProfilePage    from './pages/ProfilePage';
import NewsPage       from './pages/NewsPage';
import GuidePage      from './pages/GuidePage';
import AdminPage      from './pages/AdminPage';

const PAGES = {
  home:        HomePage,
  auth:        AuthPage,
  lobby:       LobbyPage,
  roomWaiting: RoomWaitingPage,
  briefing:    BriefingPage,
  game:        GamePage,
  voting:      VotingPage,
  test:        TestPage,
  editor:      EditorPage,
  profile:     ProfilePage,
  news:        NewsPage,
  guide:       GuidePage,
  admin:       AdminPage,
};

export default function App() {
  const [loaded,      setLoaded]      = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [gameState,   setGameState]   = useState(null);

  const navigate = useCallback((page, state = null) => {
    if (PAGES[page]) {
      setCurrentPage(page);
      if (state !== null) setGameState(prev => ({ ...(prev || {}), ...state }));
      window.scrollTo(0, 0);
    }
  }, []);

  const PageComponent = PAGES[currentPage] || HomePage;

  return (
    <AuthProvider>
      <ToastProvider>
        {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
        {loaded && (
          <>
            <Navbar currentPage={currentPage} navigate={navigate} />
            <PageComponent navigate={navigate} gameState={gameState} setGameState={setGameState} />
          </>
        )}
      </ToastProvider>
    </AuthProvider>
  );
}
