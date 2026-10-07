/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditWSForm from './editWSForm';
import { useUrl } from './UrlProvider';
import convertDateToCzech from '../utils/czechdates';

const WorkshopList = ({
  firmId: propFirmId,
  onSave,
  firmName: propFirmName,
  onClose,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const firmId = propFirmId || id;

  const { apiUrl } = useUrl();
  const [workshops, setWorkshops] = useState([]);
  const [firmName, setFirmName] = useState(propFirmName || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const fetchFirmInfo = async () => {
      if (!propFirmName && firmId) {
        try {
          const res = await axios.get(`${apiUrl}firms/${firmId}`);
          if (res.data && res.data.name) {
            setFirmName(res.data.name);
          }
        } catch (e) {
          console.error('Failed to fetch firm name:', e);
        }
      }
    };
    fetchFirmInfo();
  }, [firmId, propFirmName, apiUrl]);

  useEffect(() => {
    const fetchworkshops = async () => {
      if (!firmId) return;
      try {
        const response = await axios.get(`${apiUrl}workshops/${firmId}`);
        if (Array.isArray(response.data) && response.data.length === 0) {
          console.log('WS žádná data');
        } else {
          setWorkshops(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchworkshops();
  }, [firmId, selectedContact, apiUrl]);

  const deleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`${apiUrl}workshops/${contactId}`);
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

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handledelClick = (contact) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteContact(contact.id);
    }
  };

  const handleEditClick = (ws) => {
    setSelectedContact(ws);
  };

  const handleClose = () => {
    setSelectedContact(null);
  };

  const handleSave = (updatedWorkshop) => {
    setWorkshops(workshops.map(
      (workshop) => (workshop.id === updatedWorkshop.id ? updatedWorkshop : workshop),
    ));
    setSelectedContact(null);
    if (onSave) onSave();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (!selectedContact) {
        handleBack();
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

  const displayName = firmName ? firmName.split('/(kont)')[0] : '';

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      {error && (
        <p className="edit-firm-success edit-firm-error">
          Chyba:&nbsp;{error}
        </p>
      )}
      {selectedContact ? (
        <EditWSForm contact={selectedContact} onSave={handleSave} onClose={handleClose} />
      ) : (
        <>
          <div style={{ marginBottom: '15px' }}>
            <button className="fn-btn" type="button" onClick={handleBack}>← Zpět na seznam firem</button>
          </div>
          <table className="responsive-table">
            <caption>
              <h3>{displayName ? `Akce s firmou ${displayName}` : 'Akce s firmou'}</h3>
            </caption>
            <thead>
              <tr>
                <th className="hidden">ID</th>
                <th>Datum</th>
                <th>Typ</th>
                <th>Poznámka</th>
                <th />
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
        </>
      )}
    </div>
  );
};

WorkshopList.propTypes = {
  firmId: PropTypes.string,
  onSave: PropTypes.func,
  firmName: PropTypes.string,
  onClose: PropTypes.func,
};

WorkshopList.defaultProps = {
  firmId: null,
  onSave: () => {},
  firmName: '',
  onClose: null,
};

export default WorkshopList;