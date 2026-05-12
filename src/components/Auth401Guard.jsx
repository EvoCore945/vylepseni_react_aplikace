import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useUrl } from './UrlProvider';

const Auth401Guard = ({ children }) => {
  const { url } = useUrl();
  const redirectedRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    const checkAuth = async () => {
      // React 18 StrictMode v dev režimu volá effect 2× → zabráníme dvojitému redirectu
      if (redirectedRef.current) {
        return;
      }

      try {
        const res = await fetch(`${url}rest.php/user`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (res.status === 401) {
          redirectedRef.current = true;
          const returnUrl = encodeURIComponent(
            `${window.location.pathname}${window.location.search}`,
          );

          window.location.href = `${url}?returnUrl=${returnUrl}`;
        }
      } catch (e) {
        console.log(e);
      }
    };

    checkAuth();

    return () => {
      controller.abort();
    };
  }, [url]);

  return children;
};

Auth401Guard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Auth401Guard;
