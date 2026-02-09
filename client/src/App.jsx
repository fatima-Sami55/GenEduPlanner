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
  const location = useLocation();
  const hasProfile = localStorage.getItem('currentStudentId');
  const isGenerated = localStorage.getItem('reportGenerated') === 'true';
  const hasData = localStorage.getItem('roadmapData');
  const hasError = location.state?.error;

  // Allow access if:
  // 1. Profile exists AND (Report is generated OR Data exists in storage)
  // 2. Profile exists AND An error occurred during generation (so we can show the error)
  if (!hasProfile || (!isGenerated && !hasData && !hasError)) {
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
