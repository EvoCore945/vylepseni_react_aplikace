import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
const GoogleAuthContext = createContext();

export const useGoogleAuth = () => useContext(GoogleAuthContext);

export const GoogleAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const responseGoogle = (response) => {
        setUser(response.profileObj);
        // Save the access token to make API requests
        localStorage.setItem('googleAccessToken', response.accessToken);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('googleAccessToken');
    };

    return (
        <GoogleAuthContext.Provider value={{ user, responseGoogle, logout }}>
            {children}
        </GoogleAuthContext.Provider>
    );
};

GoogleAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
  };
