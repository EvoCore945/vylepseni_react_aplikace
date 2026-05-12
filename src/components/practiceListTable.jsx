/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable camelcase */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const PracticeListTable = () => {
  const { apiUrl, isDirty, setIsDirty } = useUrl();
  const { firmId } = useParams();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [insertFalse, setInsertFalse] = useState([]);
  const showErrorsMessage = () => {
    setIsErrorVisible(true);
  };
  const showSuccessMessage = () => {
    setIsSuccessVisible(true);
  };
  const csvURL = `${apiUrl}practices/0/?csvexport`;
  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const response = await axios.get(`${apiUrl}practices/${firmId}`);
        if (Array.isArray(response.data) && response.data.length === 0
          && response.data.msg !== undefined) {
          setError('Žádné praxe.');
        } else {
          console.log(response.data);
          setPractices(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, [loading, firmId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty) {
        return;
      }

      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleUpdate = () => {
    setLoading(true);
    /*
    for (i=0;insertFalse.length;i++) {
      practices[i].insert=false;
    }
    setPractices(practices);
  }
    */
    /*
      const updatedPractices = practices.map((item, index) => {
        if (insertFalse.includes(index)) {
          return {
            ...item,
            insert: false,
          };
        }
        return item;
      });
        setPractices(updatedPractices);
    */
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = `${apiUrl}/practices/`;
    const method = 'post';
    console.log(practices);
    axios({
      method,
      url,
      data: practices,
    })
      .then((response) => {
        setIsDirty(false);
        console.log(response.data);
        if (response.data.id !== undefined) {
          showSuccessMessage();
          handleUpdate();
        } else
          if (response.data.msg !== undefined) {
            if (response.data.msg === true) {
              showSuccessMessage();
              console.log(response.data.msg);
              handleUpdate();
            } else {
              showErrorsMessage();
            }
          } else {
            showErrorsMessage();
          }
      })
      .catch((err) => {
        console.error('Chyba při odesílání', err);
        showErrorsMessage();
      });
  };

  const handleChange = (e, index) => {
    // console.log(practices);
    setIsDirty(true);
    console.log(isDirty);
    const updated = [...practices];
    const { name, value } = e.target;
    updated[index][name] = value;

    const {
      date_time, subject, annual, count,
    } = updated[index];
    console.log(updated[index]);
    const isValid = date_time && subject && annual && count;
    updated[index].invalid = !isValid;
    insertFalse.push(index);
    setInsertFalse(insertFalse);
    setPractices(updated);
  };
  const addRow = (practice) => {
    if (practices.length === 0) {
      return;
    }

    const index = practices.findIndex((item) => item.firm_id === practice.firm_id);
    const lastRow = practices[practices.length - 1];

    const newRow = {
      ...practice,
      insert: true,
      key: lastRow.key + 1,
      id: `tmp-${crypto.randomUUID()}`,
    };
    setIsDirty(true);

    newRow.insert = true;
    newRow.key = lastRow.key + 1;

    const updatedPractices = [
      ...practices.slice(0, index + 1),
      newRow,
      ...practices.slice(index + 1),
    ];

    setPractices(updatedPractices);
    console.log(practices);
  };

  const addFirmBnt = (practice) => (
    <button type="button" className="add-firm-bnt" onClick={() => addRow(practice)}>+</button>
  );
  const deletePractice = async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}practices/${id}`);
      if (response.status === 200) {
        // fetchData();
        setPractices((prevFirm) => prevFirm.filter((firm) => firm.id !== id));
        setIsDirty(false);
      } else {
        setError('Smazání selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      console.log(practices);
      setLoading(false);
      setLoading(true);// pro vyrekslněí prázdého řádku tabulky
    }
  };
  const handledelClick = (practice) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deletePractice(practice.id);
    }
  };
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortByKey = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const sortedData = [...practices].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setPractices(sortedData);
    setSortConfig({ key, direction });
  };
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  if (loading) {
    return <p className="no-data">Načítám...</p>;
  }
  if (error) {
    return (
      <p className="no-data">
        Chyba:
        {error}
      </p>
    );
  }
  return (
    <div className="responsive-table">
      {isSuccessVisible && (<Notification message="Uloženo" type="edit-firm-success" />)}
      {isErrorVisible && (<Notification message="Chyba při ukládání!" type="edit-firm-error" />)}
      <table className="firmlist practice-table">
        <caption>{isDirty && 'Neuloženo'}</caption>
        <thead>
          <tr>
            <th
              onClick={() => sortByKey('name')}
            >
              Firma
              {getSortIcon('name')}
            </th>
            <th
              onClick={() => sortByKey('date_time')}
            >
              Datum a čas
              {getSortIcon('date_time')}
            </th>
            <th
              onClick={() => sortByKey('subject')}
            >
              Obor
            </th>
            <th
              onClick={() => sortByKey('annual')}
            >
              Ročník
            </th>
            <th>Počet žáků</th>
            <th>Poznámka</th>
            <th>
              <button type="button" onClick={handleSubmit}>Uložit změny</button>
              <a href={csvURL} id="csv_export">CSV export</a>
            </th>
          </tr>
        </thead>
        <tbody>
          {practices.map((practice, index) => (
            <tr key={practice.id} className={practice.invalid ? 'invalid-row' : ''}>
              <td data-label="firma" className={getSortIcon('firma') ? 'sorted-colm' : ''}>
                <Link
                  to={`/firm/${encodeURIComponent(practice.name)}`}
                  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'inherit' }}
                >
                  {practice.name}
                </Link>
              </td>
              <td data-label="Datum a čas" className={getSortIcon('date_time') ? 'sorted-colm' : ''}>
                <input
                  name="date_time"
                  type="month"
                  value={practice.date_time ?? ''}
                  onChange={(e) => handleChange(e, index)}
                />
              </td>
              <td data-label="Obor">
                <select id="subject" name="subject" value={practice.subject ?? ''} onChange={(e) => handleChange(e, index)}>
                  <option value="">---</option>
                  <option value="1">IT</option>
                  <option value="2">ELE</option>
                  <option value="3">ELE,IT</option>
                </select>
              </td>
              <td data-label="Ročník"><input type="number" min="2" max="3" name="annual" value={practice.annual ?? ''} onChange={(e) => handleChange(e, index)} /></td>
              <td data-label="Počet žáků">
                <input
                  type="number"
                  name="count"
                  value={practice.count ?? ''}
                  onChange={(e) => handleChange(e, index)}

                />
              </td>
              <td data-label="Poznámka">
                <textarea
                  name="notes"
                  id="Poznámka"
                  onChange={(e) => handleChange(e, index)}
                  defaultValue={practice.notes ?? ''}
                />
              </td>
              <td>
                {addFirmBnt(practice)}
                <button type="button" onClick={() => handledelClick(practice)} className="del-btn">-</button>
              </td>
            </tr>
          ))}
          <tr>
            <td />
            <td />
            <td />
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PracticeListTable;
