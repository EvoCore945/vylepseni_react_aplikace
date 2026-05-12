import PropTypes from 'prop-types';
import React from 'react';

const SelectSchoolYear = ({ selectedYear, setSelectedYear }) => {
  const numberOfYears = 6;
  console.log(selectedYear);
  const sYear = `${selectedYear - 1}/${selectedYear}`;
  const y = new Date().getFullYear();
  const handleChange = (e) => {
    console.log(e.target.value);
    setSelectedYear(parseInt(e.target.value.split('/')[1], 10));
  };
  const schoolYears = Array.from({ length: numberOfYears }, (_, i) => {
    const from = y - 1 - i;
    const to = from + 1;
    return `${from}/${to}`;
  });

  return (
    <select value={sYear} onChange={handleChange}>
      {schoolYears.map((year) => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  );
};

SelectSchoolYear.propTypes = {
  selectedYear: PropTypes.number.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
};

export default SelectSchoolYear;
