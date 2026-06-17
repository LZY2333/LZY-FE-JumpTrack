import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import PrivateRoute from './PrivateRoute';
import { routes } from './routes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {routes.map(({ path, element, role }) => (
          <Route
            key={path}
            path={path}
            element={role ? <PrivateRoute role={role}>{element}</PrivateRoute> : element}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}


