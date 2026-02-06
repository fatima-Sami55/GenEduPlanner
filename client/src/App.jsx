import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/layout';
import Landing from './pages/Landing';
import Questionnaire from './pages/Questionnaire';
import Loading from './pages/Loading';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
