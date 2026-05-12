/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useUrl } from './UrlProvider';

const Stats = () => {
  const [data, setData] = useState([]);
  const [prevData, setprevData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { url, apiUrl } = useUrl();
  const [filterText, setFilterText] = useState('');
  const csvURL = `${apiUrl}stats/?csvexport`;

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}stats`);
      setData(response.data);
      setprevData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (event) => {
    const { value } = event.target;
    setFilterText(value);
    // console.log(event.code);
    if (event.code === 'Backspace') {
      setData(prevData);
    }
    if (value.length === 0 || event.code === 'Backspace') {
      setData(prevData);
    } else {
      const normalizedValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const newFilteredData = data.filter((item) => {
        const itemName = item.name ? item.name.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
        return itemName.includes(normalizedValue);
      });
      setData(newFilteredData);
    }
  };
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortByKey = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const sortedData = [...prevData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  if (loading) {
    return <p>Načítání...</p>;
  }

  if (error) {
    return (
      <p>
        Chyba:&nbsp;
        {error}
        <a href={`${url}`}>Přihlásit</a>
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <p>
          Žádné data.
        </p>
        <input
          type="text"
          name="name"
          className="search"
          placeholder="vyhledávání"
          value={filterText}
          onChange={(e) => handleFilter(e)}
          onKeyDown={handleFilter}
        />
      </>
    );
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
    <>
      <div className="filter-bar">
        <input
          type="text"
          name="name"
          className="search"
          placeholder="vyhledávání"
          value={filterText}
          onChange={(e) => handleFilter(e)}
          onKeyDown={handleFilter}
        />
        <a href={csvURL} id="csv_export">CSV export</a>
      </div>
      <table className="firmlist statlist">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                onClick={() => sortByKey(column)}
                className={getSortIcon(column) ? 'sorted-colm' : ''}
              >
                {column === 'name' ? (
                  `Firma (${mappedData.length})`
                ) : (
                  `${column.replace(/_/g, ' ')} ${getSortIcon(column)}`
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mappedData.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column} className={getSortIcon(column) ? 'sorted-colm' : ''}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Stats;
