/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const MultiSelect = ({
  options = [],
  selectedValues = [],
  onChange,
}) => {
  const [selected, setSelected] = useState(
    Array.isArray(selectedValues) ? selectedValues : [],
  );

  const [filter, setFilter] = useState('');

  useEffect(() => {
    setSelected(
      Array.isArray(selectedValues) ? selectedValues : [],
    );
  }, [selectedValues]);

  const safeOptions = Array.isArray(options) ? options : [];

  const filterValues = filter
    .split(/;|\t/)
    .map((val) => val.trim().toLowerCase())
    .filter((val) => val.length > 0);

  const filteredOptions = safeOptions.filter((option) => {
    if (!option || typeof option.name !== 'string') {
      return false;
    }

    if (filterValues.length === 0) {
      return true;
    }

    return filterValues.some((val) => (
      option.name.toLowerCase().includes(val)
    ));
  });

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    let updatedSelected = Array.isArray(selected)
      ? [...selected]
      : [];

    if (checked) {
      if (!updatedSelected.includes(value)) {
        updatedSelected.push(value);
      }
    } else {
      updatedSelected = updatedSelected.filter(
        (item) => item !== value,
      );
    }

    setSelected(updatedSelected);

    if (typeof onChange === 'function') {
      onChange(updatedSelected);
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSelectAllFiltered = () => {
    const currentSelected = Array.isArray(selected)
      ? selected
      : [];

    const filteredIds = filteredOptions
      .map((option) => String(option.id));

    const updatedSelected = Array.from(
      new Set([
        ...currentSelected,
        ...filteredIds,
      ]),
    );

    setSelected(updatedSelected);

    if (typeof onChange === 'function') {
      onChange(updatedSelected);
    }
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

        <button
          type="button"
          onClick={handleSelectAllFiltered}
          style={{ marginLeft: '2.3em' }}
        >
          Zaškrtnout vše z vyfiltrovaných
        </button>
      </div>

      {filteredOptions.map((option) => {
        const optionId = String(option.id);

        return (
          <div key={optionId}>
            <label>
              <input
                type="checkbox"
                name="multi-select[]"
                value={optionId}
                checked={(
                  Array.isArray(selected)
                    ? selected
                    : []
                ).includes(optionId)}
                onChange={handleCheckboxChange}
              />

              {option.name}
            </label>
          </div>
        );
      })}
    </div>
  );
};

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),

  selectedValues: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  ),

  onChange: PropTypes.func.isRequired,
};

MultiSelect.defaultProps = {
  options: [],
  selectedValues: [],
};

export default MultiSelect;