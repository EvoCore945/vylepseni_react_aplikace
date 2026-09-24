import PropTypes from 'prop-types';
import React, {
  createContext, useContext, useMemo, useState, useEffect,
} from 'react';

const UrlContext = createContext(null);

const UrlProvider = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);
  const url = import.meta.env.PROD
    ? 'https://crm.skch.cz/ajax0/v3/'
    : 'http://localhost/';

  const apiUrl = useMemo(() => `${url}rest.php/`, [url]);

  const [user, setUser] = useState('');
  useEffect(() => {
    const fetchUser = async () => {
      let data = 'reader';
      try {
        const response = await fetch(`${url}rest.php/user`);
        if (!response.ok) {
          setUser('');
        }
        data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [url]);

  console.log(user);

  // toto vracím....
  const contextValue = useMemo(() => ({
    url, apiUrl, user, isDirty, setIsDirty,
  }), [url, apiUrl, user, isDirty]);

  return (
    <UrlContext.Provider value={contextValue}>
      {children}
    </UrlContext.Provider>
  );
};

UrlProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUrl = () => useContext(UrlContext);

// export const user = () => useContext(UrlContext);

export default UrlProvider;
