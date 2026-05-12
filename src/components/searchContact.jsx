import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const SearchContactForm = ({ setResults }) => {
  const [query, setQuery] = useState('');
  const { apiUrl } = useUrl();
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${apiUrl}contacts/search/${query}`);
      if (Array.isArray(response.data) && response.data.length === 0
      && response.data.msg !== undefined) {
        setError('Žádné kontakty.');
      } else {
        console.log(response.data);
        setResults(response.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchContacts();
  };

  /*
  useEffect(() => {
    fetchContacts();
   }, [query]);
*/
  useEffect(() => {
    inputRef.current.focus();
  });

  return (
    <div className="search-contact">
      {error && (<Notification message={error} type="edit-firm-error" />)}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zadej jméno, e-mail,tel, .."
          ref={inputRef}
        />
        <button type="submit">Hledat</button>
        <button
          type="button"
          className="clear-input-filter-btn"
          style={{
            cursor: 'pointer',
          }}
        >
          X.
        </button>
      </form>
    </div>
  );
};

export default SearchContactForm;
SearchContactForm.propTypes = {
  setResults: PropTypes.func.isRequired,
};
