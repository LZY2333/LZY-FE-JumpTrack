import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PrivateRoute from './PrivateRoute';
import TaskPool from '@/pages/TaskPool';
import MakerPage from '@/pages/MakerPage';
import CheckerPage from '@/pages/CheckerPage';
import PermissionAdmin from '@/pages/PermissionAdmin';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<TaskPool />} />
        <Route path="/task/maker/:id" element={<MakerPage />} />
        <Route path="/task/checker/:id" element={<CheckerPage />} />
        <Route
          path="/admin/permissions"
          element={<PrivateRoute><PermissionAdmin /></PrivateRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
