/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditMeetForm from './editMeetForm';
import { useUrl } from './UrlProvider';
import { convertDateTimeToCzech } from '../utils/czechdates';

const MeetList = ({
  firmId: propFirmId, onSave, firmName: propFirmName, onClose,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const firmId = propFirmId || id;

  const { apiUrl } = useUrl();
  const [meets, setMeets] = useState([]);
  const [firmName, setFirmName] = useState(propFirmName || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeet, setSelectedMeet] = useState(null);

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
    const fetchMeets = async () => {
      if (!firmId) return;
      try {
        const response = await axios.get(`${apiUrl}meets/${firmId}`);
        if (Array.isArray(response.data) && response.data.length === 0
        && response.data.msg !== undefined) {
          setError('Žádné schůzky.');
        } else {
          setMeets(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeets();
  }, [firmId, apiUrl]);

  const deleteMeet = async (meetId) => {
    try {
      const response = await axios.delete(`${apiUrl}meets/${meetId}`);
      if (response.status === 200) {
        setMeets((prevMeets) => prevMeets.filter((meet) => meet.id !== meetId));
      } else {
        setError('Smazání schůzky selhalo');
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

  const handledelClick = (meet) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteMeet(meet.id);
    }
  };

  const handleEditClick = (meet) => {
    setSelectedMeet(meet);
  };

  const handleClose = () => {
    setSelectedMeet(null);
  };

  const handleSave = (meetupdatedMeet) => {
    const existingMeet = meets.find((meet) => meet.id === meetupdatedMeet.id);
    if (!existingMeet) {
      setMeets([...meets, meetupdatedMeet]);
    } else {
      setMeets(meets.map(
        (meet) => (meet.id === meetupdatedMeet.id ? meetupdatedMeet : meet),
      ));
    }
    setSelectedMeet(null);
    if (onSave) onSave();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (!selectedMeet) {
        handleBack();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMeet]);

  if (loading) {
    return <p className="no-data">Načítám...</p>;
  }

  if (error && !meets.length) {
    return (
      <div className="page-container">
        <button className="fn-btn" type="button" onClick={handleBack}>← Zpět</button>
        <p className="no-data">Chyba: {error}</p>
      </div>
    );
  }

  const displayName = firmName ? firmName.split('/(kont)')[0] : '';

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      {selectedMeet ? (
        <EditMeetForm
          meet={selectedMeet}
          onSave={handleSave}
          onClose={handleClose}
          firmName={displayName}
        />
      ) : (
        <>
          <div style={{ marginBottom: '15px' }}>
            <button className="fn-btn" type="button" onClick={handleBack}>← Zpět na seznam firem</button>
          </div>
          <table className="responsive-table">
            <caption>
              <h3>{displayName ? `${displayName} - schůzky` : 'Schůzky'}</h3>
            </caption>
            <thead>
              <tr>
                <th>Datum a čas</th>
                <th>Poznámka</th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {meets.map((meet) => (
                <tr key={meet.id}>
                  <td data-label="Datum a čas">{convertDateTimeToCzech(meet.date_time)}</td>
                  <td data-label="Poznámka">{meet.notes}</td>
                  <td><button type="button" onClick={() => handleEditClick(meet)}>upravit</button></td>
                  <td><button type="button" onClick={() => handledelClick(meet)} className="del-btn">smazat</button></td>
                </tr>
              ))}
              <tr>
                <td />
                <td />
                <td />
                <td><button type="button" onClick={() => handleEditClick({ firm_id: firmId })}>Přidat schůzku</button></td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

MeetList.propTypes = {
  firmId: PropTypes.string,
  onSave: PropTypes.func,
  firmName: PropTypes.string,
  onClose: PropTypes.func,
};

MeetList.defaultProps = {
  firmId: null,
  onSave: () => {},
  firmName: '',
  onClose: null,
};

export default MeetList;