import { Suspense, useLayoutEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Result } from 'antd';
import IopLayout from '@/components/IopLayout';
import MainLayout from '@/components/MainLayout';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import IopIndex from './iop-routes/IopIndex';
import IopGuard from './iop-routes/IopGuard';
import { routesIop } from './iop-routes';
import { MainGuard, mainRoutes, PrivateRoute } from './main-routes';
import { RoutePath } from './routePath';

const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<MainGuard />}>
          <Route element={<MainLayout />}>
            {mainRoutes.map(({ path, element, role }) => (
              <Route
                key={path}
                path={path}
                element={role ? <PrivateRoute role={role}>{element}</PrivateRoute> : element}
              />
            ))}
            <Route path='*' element={<Navigate to={RoutePath.MessageList} replace />} />
          </Route>
        </Route>

        <Route path={RoutePath.IopRoot} element={<IopLayout />}>
          <Route element={<IopGuard />}>
            <Route index element={<IopIndex />} />
            {routesIop.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
          <Route
            path='*'
            element={
              <Result status='404' title='IOP Page Not Found' subTitle='The requested IOP page does not exist.' />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

/** 路由代码加载期间接入全局 Loading。 */
const RouteLoading = () => {
  useLayoutEffect(() => startGlobalLoading(), []);
  return null;
};
