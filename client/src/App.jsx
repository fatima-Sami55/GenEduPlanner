import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/layout';
import ScrollToTop from './components/layout/ScrollToTop';
import Landing from './pages/Landing';
import Questionnaire from './pages/Questionnaire';
import Loading from './pages/Loading';
import Results from './pages/Results';
import { NoPlanState } from './components/features/NoPlanState';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const hasProfile = localStorage.getItem('currentStudentId');
  const isGenerated = localStorage.getItem('reportGenerated') === 'true';

  if (!hasProfile || !isGenerated) {
    return <NoPlanState />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/loading" element={<Loading />} />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
