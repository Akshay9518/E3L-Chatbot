import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { UiRoutes } from './routes/allRoutes';

function App() {
  // Scroll to top when App mounts (first load)
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <Router>
      <Routes>
        {UiRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={element}
          />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
