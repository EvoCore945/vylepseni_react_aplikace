/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EditColumnForm from './editColumnForm';
import { useUrl } from './UrlProvider';

const ColumnList = () => {
  const { apiUrl } = useUrl();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const types = ['', 'Text', 'Datum', 'číslo'];

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.get(`${apiUrl}columnsList/`);
        if (Array.isArray(response.data) && response.data.length === 0
        && response.data.msg !== undefined) {
          setError('Žádná data.');
        } else {
          console.log(response.data);
          setColumns(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, []);

  const deleteColumn = async (columnId) => {
    try {
      const response = await axios.delete(`${apiUrl}column/${columnId}`);
      if (response.status === 200) {
        setColumns((prevColumns) => prevColumns.filter((column) => column.id !== columnId));
      } else {
        setError('Smazání selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (column) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteColumn(column.id);
    }
  };
  const handleEditClick = (column) => {
    console.log(column);
    setSelectedColumn(column);
  };

  const handleSave = (columnupdatedColumn) => {
    const existingColumn = columns.find((column) => column.id === columnupdatedColumn.id);
    console.log(columnupdatedColumn);
    console.log(existingColumn);
    if (!existingColumn) {
      setColumns([...columns, columnupdatedColumn]);
    } else {
      setColumns(columns.map(
        (column) => (column.id === columnupdatedColumn.id ? columnupdatedColumn : column),
      ));
    }
    setSelectedColumn(null);
  };
  const handleClose = () => {
    setSelectedColumn(null);
  };

  if (loading) {
    return <p className="no-data">Načítání dat...</p>;
  }
  if (error) {
    return (
      <p className="no-data">
        Error:
        {error}
      </p>
    );
  }
  return (
    <div>
      {selectedColumn ? (
        <EditColumnForm column={selectedColumn} onSave={handleSave} onClose={handleClose} />
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                Název&nbsp;
                <button type="button" onClick={() => handleEditClick({ id: '-1', name: '' })}>+</button>
              </th>
              <th>Typ</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {columns.map((column) => (
              <tr key={column.id}>
                <td>{column.name}</td>
                <td>{types[column.type]}</td>
                <td><button type="button" onClick={() => handleEditClick(column)}>upravit</button></td>
                <td><button type="button" onClick={() => handledelClick(column)} className="del-btn">smazat</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ColumnList;
