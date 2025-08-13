import { useState, useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import { DevNotificationModal } from './components/shared';

function App() {
  const [showDevNotification, setShowDevNotification] = useState(false);

  useEffect(() => {
    // Show the development notification popup when the app loads
    // Check if user has already seen the notification in this session
    const hasSeenNotification = sessionStorage.getItem('dev-notification-seen');
    
    if (!hasSeenNotification) {
      setShowDevNotification(true);
    }
  }, []);

  const handleCloseNotification = () => {
    setShowDevNotification(false);
    // Mark as seen for this session
    sessionStorage.setItem('dev-notification-seen', 'true');
  };

  return (
    <>
      <AppRouter />
      <DevNotificationModal 
        isOpen={showDevNotification} 
        onClose={handleCloseNotification} 
      />
    </>
  );
}

export default App;