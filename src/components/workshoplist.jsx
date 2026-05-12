/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import EditWSForm from './editWSForm';
import { useUrl } from './UrlProvider';
import convertDateToCzech from '../utils/czechdates';

const WorkshopList = ({
  firmId,
  onSave,
  firmName,
  onClose,
}) => {
  const { apiUrl } = useUrl();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const fetchworkshops = async () => {
      try {
        const response = await axios.get(`${apiUrl}workshops/${firmId}`);
        if (Array.isArray(response.data) && response.data.length === 0) {
          // setError('errr');
          console.log('WS žádná data');
        } else {
          console.log(response.data);
          setWorkshops(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchworkshops();
  }, [firmId, selectedContact]);

  const deleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`${apiUrl}/workshops/${contactId}`);
      if (response.status === 200) {
        setWorkshops((prevworkshops) => prevworkshops
          .filter((contact) => contact.id !== contactId));
      } else {
        setError('Smazání WS selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (contact) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteContact(contact.id);
    }
  };

  const handleEditClick = (ws) => {
    console.log(ws);
    setSelectedContact(ws);
  };
  const handleClose = () => {
    setSelectedContact(null);
  };
  const handleSave = (updatedWorkshop) => {
    setWorkshops(workshops.map(
      (workshop) => (workshop.id === updatedWorkshop.id ? updatedWorkshop : workshop),
    ));
    setSelectedContact(null); // Close the form after saving
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (!selectedContact) {
        onClose(null);
      }
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedContact]);

  if (loading) {
    return <p className="no-data">načítání...</p>;
  }

  return (

    <div className={`floating-layer ${!firmId ? 'hidden' : ''}`}>
      {error ? (
        <p className="edit-firm-success edit-firm-error">
          Chyba:&nbsp;
          {error}
        </p>
      ) : ''}
      <button className="close-button" type="button" onClick={onSave}>X</button>
      {selectedContact ? (
        <EditWSForm contact={selectedContact} onSave={handleSave} onClose={handleClose} />
      ) : (
        <table className="responsive-table">
          <caption><h3>{`Akce s firmou ${firmName.split('/(kont)')[0]}`}</h3></caption>
          <thead>
            <tr>
              <th className="hidden">ID</th>
              <th>Datum</th>
              <th>Typ</th>
              <th>Poznámka</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {workshops.map((workshop) => (
              <tr key={workshop.id}>
                <td data-label="ID" className="hidden">{workshop.id}</td>
                <td data-label="Datum">{convertDateToCzech(workshop.date)}</td>
                <td data-label="Typ">{workshop.type}</td>
                <td data-label="Poznámka">{workshop.notes}</td>
                <td>
                  <button type="button" onClick={() => handleEditClick(workshop)}>Upravit</button>
                </td>
                <td>
                  <button type="button" onClick={() => handledelClick(workshop)} className="del-btn">Smazat</button>
                </td>
              </tr>
            ))}
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td><button type="button" onClick={() => handleEditClick({ firmId })}>Přidat akci</button></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

WorkshopList.propTypes = {
  firmId: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  firmName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WorkshopList;
