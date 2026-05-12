/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useUrl } from './UrlProvider';

const Filter = ({ setRestFilter }) => {
  const { apiUrl } = useUrl();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Načtení dat z URL
    axios.get(`${apiUrl}columnsFilter`)
      .then((response) => {
        setFormData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleApply = () => {
    // const newformData = formData.filter((item) => item.value !== false);
    console.log(formData);
    const params = new URLSearchParams(formData);
    setRestFilter(params.toString());
  };
  const handleKeyDown = (e) => {
    console.log(`Key pressed: ${e.key}`);
    if (e.key === 'Enter') {
      handleApply();
    }
  };
  if (loading) {
    return <div>Načítání filtrů...</div>;
  }

  return (
    <section className="filter">
      <button type="button" className="filter-close-button" onClick={() => setRestFilter(false)}>X</button>    
      <div className="filter-item aplly">
        <label>
          <input
            type="checkbox"
            name="show_inactive"
            checked={formData.show_inactive || false}
            onChange={(e) => setFormData((prev) => ({ ...prev, show_inactive: e.target.checked }))}
          />
          Zobrazit i neaktivní firmy
        </label>

        <label htmlFor="apply" />
        <button id="aplly" type="button" onClick={handleApply}>
          Použít
        </button>
      </div>
    </section>
  );
};

export default Filter;

Filter.propTypes = {
  setRestFilter: PropTypes.func.isRequired,
};
