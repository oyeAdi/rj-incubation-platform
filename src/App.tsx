import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Planner from './pages/Planner';
import Dashboard from './pages/Dashboard';
import AssociateView from './pages/AssociateView';
import SharedPlan from './pages/SharedPlan';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Planner />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/associate/:id" element={<AssociateView />} />
          <Route path="/plan/:id" element={<SharedPlan />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
