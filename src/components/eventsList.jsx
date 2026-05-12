/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AddEventToGoogleCalendar from './google/AddEventToGoogleCalendar';
import { useUrl } from './UrlProvider';
import translate from '../utils/translate';

const Events = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url, apiUrl } = useUrl();

  const firmIdNum = useMemo(() => {
    if (!id) {
      return null;
    }
    return Number(id);
  }, [id]);
  /*
    const eventIdNum = useMemo(() => {
      if (!eventId) {
        return null;
      }
      return Number(eventId);
    }, [eventId]);
  */
  const [data, setData] = useState([]);
  const [prevData, setPrevData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const trans = {
    name: 'Název',
    description: 'Popis',
    time_start: 'Čas',
    firma: 'Firma',
  };
  /*
    const isCreateMode = useMemo(
      () => Boolean(firmIdNum !== null && (eventIdNum === null || Number.isNaN(eventIdNum))),
      [firmIdNum, eventIdNum],
    );
    const isEditMode = useMemo(
      () => Boolean(eventIdNum !== null && !Number.isNaN(eventIdNum)),
      [eventIdNum],
    );
  */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = firmIdNum !== null
        ? `${apiUrl}events/${firmIdNum}`
        : `${apiUrl}events`;

      const response = await axios.get(endpoint);
      setData(response.data);
      setPrevData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Načti data při změně firmy (/events vs /events/:id)
  useEffect(() => {
    fetchData();
    // apiUrl je stabilní z contextu; přidávám ho do deps kvůli pravidlům
  }, [firmIdNum, apiUrl]);
  /*
    const openedEvent = useMemo(() => {
      if (isEditMode) {
        const found = prevData.find((e) => Number(e.id) === eventIdNum);
        return found || null;
      }
        if (isCreateMode) {
        return {
          id: -1,
          name: '',
          description: '',
          time_start: '',
          firma: '',
          firm_id: firmIdNum ?? 0,
        };
      }
        return null;
    }, [isEditMode, isCreateMode, prevData, eventIdNum, firmIdNum]);
  */
  /*
    const goBackAfterClose = () => {
      if (firmIdNum !== null) {
        navigate(`/events/${firmIdNum}`, { replace: true });
      } else {
        navigate('/events', { replace: true });
      }
    };
      const handleSave = async () => {
      await fetchData();
      goBackAfterClose();
    };
  */
  const handleFilter = (e) => {
    const { value } = e.target;
    setFilterText(value);

    if (value.length === 0) {
      setData(prevData);
      return;
    }

    const normalizedValue = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const newFilteredData = prevData.filter((item) => {
      const itemName = item.name
        ? item.name
          .toString()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
        : '';

      return itemName.includes(normalizedValue);
    });

    setData(newFilteredData);
  };

  const sortByKey = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sorted = [...prevData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setData(sorted);
  };

  const addEventBtn = () => (
    <button
      type="button"
      className="add-firm-bnt"
      onClick={() => {
        if (firmIdNum === null) {
          navigate('/events/0/new');
          return;
        }
        navigate(`/events/${firmIdNum}/new`);
      }}
    >
      +
    </button>
  );

  const deleteEvent = async (idToDelete) => {
    try {
      const response = await axios.delete(`${apiUrl}events/${idToDelete}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((x) => x.id !== idToDelete));
        setPrevData((prev) => prev.filter((x) => x.id !== idToDelete));
      } else {
        setError('Smazání události selhalo');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handledelClick = (idToDelete) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteEvent(idToDelete);
    }
  };

  const csvURL = `${apiUrl}events/0/?csvexport`;

  if (loading) {
    return <p>Načítání...</p>;
  }

  if (error) {
    return (
      <p>
        Chyba:
        {' '}
        {error}
        {' '}
        <a href={`${url}`}>Přihlásit</a>
      </p>
    );
  }

  // žádná data – ale stále umožnit vytvořit event přes URL
  if (!prevData || prevData.length === 0) {
    return (
      <>
        <p>
          Žádná data.
          {' '}
          {addEventBtn()}
        </p>

        <input
          type="text"
          name="name"
          className="search"
          placeholder="vyhledávání"
          value={filterText}
          onChange={handleFilter}
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
  const isValidDateTime = (value) => {
    if (!value || typeof value !== 'string' || value.trim().length < 1) {
      return false;
    }

    const str = value.trim();

    // 1) CZ formát: dd.MM.yyyy HH:mm[:ss]
    // - den 01-31, měsíc 01-12, rok 0000-9999
    // - hodiny 00-23, minuty 00-59, sekundy nepovinné 00-59
    const czRe = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const m = czRe.exec(str);
    if (m) {
      const day = Number(m[1]);
      const month = Number(m[2]); // 1-12
      const year = Number(m[3]);
      const hour = Number(m[4]);
      const minute = Number(m[5]);
      const second = m[6] !== undefined ? Number(m[6]) : 0;

      // rychlé rozsahové kontroly
      if (
        (month < 1) || (month > 12)
        || (day < 1) || (day > 31)
        || (hour < 0) || (hour > 23)
        || (minute < 0) || (minute > 59)
        || (second < 0) || (second > 59)
      ) {
        return false;
      }

      // Sestav lokální datum (pozor: měsíc je 0-based)
      const d = new Date(year, month - 1, day, hour, minute, second);

      // Ověřit, že složené datum odpovídá vstupu (zachytí neexistující data typu 31.02.)
      if (
        (d.getFullYear() === year)
        && (d.getMonth() === month - 1)
        && (d.getDate() === day)
        && (d.getHours() === hour)
        && (d.getMinutes() === minute)
        && (d.getSeconds() === second)
      ) {
        return true;
      }

      return false;
    }

    // 2) ISO 8601 / RFC 2822 a další formáty podporované nativně
    const t = Date.parse(str);
    return !Number.isNaN(t);
  };

  return (
    <>
      <div className="filter-bar">
        <input
          type="text"
          name="name"
          className="search"
          placeholder="vyhledávání"
          value={filterText}
          onChange={handleFilter}
        />
      </div>

      <table className="firmlist eventlist responsive-table">
        <caption>
          <h3>Události</h3>
        </caption>

        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                onClick={() => sortByKey(column)}
                className={`col-name-${column}`}
              >
                {column === 'name' ? (
                  <>
                    Událost
                    {' '}
                    (
                    {mappedData.length}
                    )
                    {' '}
                    {addEventBtn()}
                  </>
                ) : (
                  translate(column)
                )}
              </th>
            ))}
            <th>
              <a href={csvURL} id="csv_export">CSV export</a>
            </th>
          </tr>
        </thead>

        <tbody>
          {mappedData.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => {
                if (column === 'firma') {
                  return (
                    <td
                      key={column}
                      data-label={`${trans[column]} :`}
                      className={trans[column] ?? 'hidden'}
                      style={{ cursor: 'pointer', color: '#E8474C' }}
                      onClick={() => {
                        if (row.firm_id) {
                          navigate(`/${row.firm_id}`);
                        }
                      }}
                      title="Přejít na firmu"
                    >
                      {row[column]}
                    </td>
                  );
                }

                return (
                  <td
                    key={column}
                    data-label={`${trans[column]} :`}
                    className={trans[column] ?? 'hidden'}
                  >
                    {row[column]}
                  </td>
                );
              })}

              <td className="btn-td">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/events/${row.firm_id}/${row.id}`);
                  }}
                >
                  Upravit
                </button>

                <button type="button">
                  <a
                    href={`${apiUrl}events/generateICS/${row.id}`}
                    className="no-link-style"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Stáhnout
                  </a>
                </button>
              </td>

              <td className="btn-td">
                {isValidDateTime(row.time_start) ? (
                  <AddEventToGoogleCalendar
                    title={row.name}
                    description={row.description}
                    startDate={row.time_start}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    handledelClick(row.id);
                  }}
                  className="del-btn"
                >
                  Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Events;
