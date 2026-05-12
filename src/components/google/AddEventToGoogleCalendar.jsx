import PropTypes from 'prop-types';
import React from 'react';
import { DateTimeComponent } from '../../utils/czechdates';

const addOneHour = (dateTime) => {
  const date = new Date(DateTimeComponent(dateTime));
  date.setHours(date.getHours() + 1);
  return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
};

const AddEventToGoogleCalendar = ({ title, description, startDate }) => {
  console.log(title);
  console.log(description);
  console.log(startDate);
  if (title === undefined) {
    return '';
  }
  if (description === undefined) {
    return '';
  }
  if (startDate === undefined) {
    return '';
  }

  const location = 'Prague, Czechia';
  const endDate = addOneHour(startDate);
  const startDate2 = new Date(DateTimeComponent(startDate));
  console.log(startDate);
  console.log(endDate);
  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate2.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endDate.replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;

  return (
    <button type="button" className="fn-btn">
      <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
        Přidat do kalendáře
      </a>
    </button>
  );
};

export default AddEventToGoogleCalendar;
AddEventToGoogleCalendar.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
};
