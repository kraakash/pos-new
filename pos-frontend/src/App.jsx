import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './component/Auth';
import DashboardPage from './component/Dashboard';
import PracticePage from './component/Practice';
import QuestionDetail from './component/QuestionDetail';

// Roadmap module (modular engine)
import RoadmapHub from './pages/roadmaps/RoadmapHub';
import RoadmapOverview from './pages/roadmaps/RoadmapOverview';
import StageDetail from './pages/roadmaps/StageDetail';
import DailyMission from './pages/roadmaps/DailyMission';
import CompanyTrack from './pages/roadmaps/CompanyTrack';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Legacy /roadmap redirect to new hub */}
        <Route path="/roadmap" element={<Navigate to="/roadmaps" />} />

        {/* Roadmap module routes */}
        <Route path="/roadmaps" element={<RoadmapHub />} />
        <Route path="/roadmaps/:roadmapId" element={<RoadmapOverview />} />
        <Route path="/roadmaps/:roadmapId/stage/:stageId" element={<StageDetail />} />
        <Route path="/roadmaps/:roadmapId/daily" element={<DailyMission />} />
        <Route path="/roadmaps/:roadmapId/companies" element={<CompanyTrack />} />

        {/* Practice */}
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/:id" element={<QuestionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
