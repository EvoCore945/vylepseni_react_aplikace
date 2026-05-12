import PropTypes from 'prop-types';
import React from 'react';
import { GoogleAuthProvider, useGoogleAuth } from './googleAuthProvider';
import SyncContacts from './syncContacts';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

const App = () => {
  const { user, responseGoogle, logout } = useGoogleAuth();

  return (
      <GoogleAuthProvider>
          <div>
              <h1>Google Contacts Sync</h1>
              {user ? (
                  <>
                      <p>
                        Čus,
                        {user.name}
                      </p>
                      <GoogleLogout
                          clientId="545628991327-6uqtgshdtlh394simt7u50esaf0r19de.apps.googleusercontent.com"
                          buttonText="Logout"
                          onLogoutSuccess={logout}
                      />
                      <SyncContacts />
                  </>
              ) : (
                  <GoogleLogin
                      clientId="545628991327-6uqtgshdtlh394simt7u50esaf0r19de.apps.googleusercontent.com"
                      buttonText="Login with Google"
                      onSuccess={responseGoogle}
                      onFailure={responseGoogle}
                      cookiePolicy={'single_host_origin'}
                      scope="https://www.googleapis.com/auth/contacts.readonly"
                  />
              )}
          </div>
      </GoogleAuthProvider>
  );
};
export default App;

GoogleAuthProvider.propTypes = {
  user: PropTypes.node.isRequired,
  responseGoogle: PropTypes.node.isRequired,
  logout: PropTypes.node.isRequired,
  };
