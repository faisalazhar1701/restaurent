import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EntryPage from './pages/guest/EntryPage';
import MenuPage from './pages/guest/MenuPage';
import PeoplePage from './pages/guest/PeoplePage';
import OrderPathPage from './pages/guest/OrderPathPage';
import SeatingPage from './pages/guest/SeatingPage';
import RewardsPage from './pages/guest/RewardsPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminSeatingPage from './pages/admin/SeatingPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guest" element={<EntryPage />} />
        <Route path="/guest/menu" element={<MenuPage />} />
        <Route path="/guest/people" element={<PeoplePage />} />
        <Route path="/guest/order-path" element={<OrderPathPage />} />
        <Route path="/guest/seating" element={<SeatingPage />} />
        <Route path="/guest/rewards" element={<RewardsPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="seating" element={<AdminSeatingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
