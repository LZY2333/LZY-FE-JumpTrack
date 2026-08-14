import { useRef } from 'react';
import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function TokenGuard({ children }: { children: ReactElement }) {
  const location = useLocation();
  const currentToken = new URLSearchParams(location.search).get('otfUserToken')?.trim();
  const retainedTokenRef = useRef(currentToken);

  if (currentToken) {
    retainedTokenRef.current = currentToken;
  }

  if (!currentToken && retainedTokenRef.current) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('otfUserToken', retainedTokenRef.current);

    return (
      <Navigate
        to={{
          pathname: location.pathname,
          search: `?${searchParams.toString()}`,
          hash: location.hash,
        }}
        replace
      />
    );
  }

  return children;
}
