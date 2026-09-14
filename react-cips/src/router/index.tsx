import { Routes, Route, Navigate } from 'react-router-dom';
import { Result } from 'antd';
import IopLayout from '@/components/IopLayout';
import MainLayout from '@/components/MainLayout';
import AuthenticatedEntry from './AuthenticatedEntry';
import PrivateRoute from './PrivateRoute';
import { RoutePath, routes } from './routes';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={`${RoutePath.IopRoot}/*`} element={<IopLayout />}>
        <Route
          path='*'
          element={<Result status='404' title='IOP Page Not Found' subTitle='The requested IOP page does not exist.' />}
        />
      </Route>

      <Route element={<AuthenticatedEntry />}>
        <Route element={<MainLayout />}>
          {routes.map(({ path, element, role }) => (
            <Route
              key={path}
              path={path}
              element={role ? <PrivateRoute role={role}>{element}</PrivateRoute> : element}
            />
          ))}
          <Route path='*' element={<Navigate to={RoutePath.MessageList} replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
