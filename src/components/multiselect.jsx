/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

const MultiSelect = ({ options, selectedValues, onChange }) => {
  const [selected, setSelected] = useState(selectedValues || []);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  const filterValues = filter
    .split(/;|\t/)
    .map((val) => val.trim().toLowerCase())
    .filter((val) => val.length > 0);

  const filteredOptions = options.filter((option) => {
    if (filterValues.length === 0) {
      return true;
    }
    return filterValues.some((val) => option.name.toLowerCase().includes(val));
  });

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    let updatedSelected = [...selected];
    if (checked) {
      updatedSelected.push(value);
    } else {
      updatedSelected = updatedSelected.filter((item) => item !== value);
    }
    setSelected(updatedSelected);
    onChange(updatedSelected);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredOptions.map((option) => option.id);
    const updatedSelected = Array.from(new Set([...selected, ...filteredIds]));
    setSelected(updatedSelected);
    onChange(updatedSelected);
  };

  return (
    <div className="multi-select">
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 1,
          paddingBottom: '1em',
          paddingTop: '1em',
        }}
      >
        <input
          type="text"
          id="filter"
          value={filter}
          onChange={handleFilterChange}
          placeholder="např. ja; ne; ty"
        />
        <button type="button" onClick={handleSelectAllFiltered} style={{ marginLeft: '2.3em' }}>
          Zaškrtnout vše z vyfiltrovaných
        </button>
      </div>

      {filteredOptions.map((option) => (
        <div key={option.id}>
          <label>
            <input
              type="checkbox"
              name="multi-select[]"
              value={option.id}
              checked={selected.includes(option.id)}
              onChange={handleCheckboxChange}
            />
            {option.name}
          </label>
        </div>
      ))}
    </div>
  );
};

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedValues: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default MultiSelect;
