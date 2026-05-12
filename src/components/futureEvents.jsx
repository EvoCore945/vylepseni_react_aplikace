/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUrl } from './UrlProvider';

const FutureEvents = () => {
  const [data, setData] = useState([]);
  const [prevData, setprevData] = useState([]);
  const [error, setError] = useState(null);
  const { apiUrl } = useUrl();
  const navigate = useNavigate();

  const filterDataByIds = (xdata) => {
    const closedIds = JSON.parse(localStorage.getItem('closedIds')) || [];
    const idsToFilter = closedIds.map((item) => item.id);
    return xdata.filter((item) => !idsToFilter.includes(item.id));
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}events/getFutureEvents`);
      const filteredData = filterDataByIds(response.data);
      setData(filteredData);
      setprevData(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = (id, e) => {
    e.stopPropagation();
    const newFilteredData = data.filter((item) => (
      item.id !== id
    ));
    setData(newFilteredData);

    // Get existing closed IDs from localStorage
    const closedIds = JSON.parse(localStorage.getItem('closedIds')) || [];

    // Add the new ID with a timestamp
    const timestamp = new Date().getTime();
    closedIds.push({ id, timestamp });

    // Store the updated closed IDs in localStorage
    localStorage.setItem('closedIds', JSON.stringify(closedIds));
  };

  const cleanUpExpiredIds = () => {
    const closedIds = JSON.parse(localStorage.getItem('closedIds')) || [];
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const now = new Date().getTime();

    // Filter out IDs that are older than one day
    const validIds = closedIds.filter((item) => (now - item.timestamp) < oneDay);

    // Store the valid IDs back in localStorage
    localStorage.setItem('closedIds', '');
    localStorage.setItem('closedIds', JSON.stringify(validIds));
  };

  const onOpen = (row) => {
    // console.log('open future event:', row);
    navigate(`/events/${row.firm_id}/${row.id}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    cleanUpExpiredIds();
  }, []);

  if (error || data.length === 0) {
    return ('');
  }

  const columns = Object.keys(prevData[0]);
  const mappedData = data.map((item) => {
    const mappedItem = {};
    columns.forEach((key) => {
      mappedItem[key] = item[key];
    });
    return mappedItem;
  });

  return (
    <div className="future-events">
      {mappedData.map((row) => (
        <div
          className="future-event"
          role="button"
          id={`fe-${row.id}`}
          key={row.id}
          onClick={() => onOpen(row)}
          onKeyDown={(e) => (e.key === 'Enter' ? onOpen(row) : null)}
        >
          <button type="button" className="close-btn" onClick={(e) => handleClose(row.id, e)}>x</button>
          {columns.map((column) => (
            <span className={column} key={column}>{row[column]}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FutureEvents;
