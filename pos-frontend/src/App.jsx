import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './component/Auth';
import DashboardPage from './component/Dashboard';
import PracticePage from './component/Practice';
import Roadmap from './component/Roadmap';
import QuestionDetail from './component/QuestionDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/:id" element={<QuestionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
