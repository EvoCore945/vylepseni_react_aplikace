/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

const Filter = ({ setRestFilter, initFormData }) => {
  const [formData, setFormData] = useState(initFormData || {});
  console.log(initFormData);
  useEffect(() => {
    setFormData(initFormData || {});
  }, [initFormData]);

  const handleApply = () => {
    // const newformData = formData.filter((item) => item.value !== false);
    const params = new URLSearchParams(formData);
    for (const key in formData) {
      if (formData[key] !== undefined && formData[key] !== null) {
        params.append(key, formData[key].toString());
      }
    }
    setRestFilter(formData);
  };

  const handleChange = (event) => {
    const {
      name, type, checked, value,
    } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <section className="filter">
      <button type="button" className="filter-close-button" onClick={() => setRestFilter(false)}>X</button>
      <div className="filter-item aplly">
        <label>
          <input
            type="checkbox"
            name="show_inactive"
            checked={formData.show_inactive || false}
            onChange={handleChange}
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
  initFormData: PropTypes.shape({
    show_inactive: PropTypes.bool,
    // další klíče podle potřeby
  }),

};
