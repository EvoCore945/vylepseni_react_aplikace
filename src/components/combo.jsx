import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

const Combo = ({
  id,
  value,
  url,
  onChange,
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Fetch data via AJAX
    axios.get(url)
      .then((response) => {
        setOptions(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <select id={id} name={id} value={value} onChange={onChange} className="combo">
      <option value="">---</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
};

export default Combo;

Combo.propTypes = {
  value: PropTypes.string,
  url: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
