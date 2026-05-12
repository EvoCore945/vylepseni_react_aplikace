/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import EditMeetForm from './editMeetForm';
import { useUrl } from './UrlProvider';
import { convertDateTimeToCzech } from '../utils/czechdates';

const MeetList = ({
  firmId, onSave, firmName, onClose,
}) => {
  const { apiUrl } = useUrl();
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeet, setSelectedMeet] = useState(null);

  useEffect(() => {
    const fetchMeets = async () => {
      try {
        const response = await axios.get(`${apiUrl}meets/${firmId}`);
        if (Array.isArray(response.data) && response.data.length === 0
        && response.data.msg !== undefined) {
          setError('Žádné schůzky.');
        } else {
          console.log(response.data);
          setMeets(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeets();
  }, [firmId]);

  const deleteMeet = async (meetId) => {
    try {
      const response = await axios.delete(`${apiUrl}meets/${meetId}`);
      if (response.status === 200) {
        setMeets((prevMeets) => prevMeets.filter((meet) => meet.id !== meetId));
      } else {
        setError('Smazání kontaktu selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (meet) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteMeet(meet.id);
    }
  };
  const handleEditClick = (meet) => {
    console.log(meet);
    setSelectedMeet(meet);
  };
  const handleClose = () => {
    setSelectedMeet(null);
  };
  const handleSave = (meetupdatedMeet) => {
    const existingMeet = meets.find((meet) => meet.id === meetupdatedMeet.id);
    const updatedMeet = {
      ...meetupdatedMeet,
      date_time: convertDateTimeToCzech(meetupdatedMeet.date_time),
    };
    console.log(updatedMeet);
    if (!existingMeet) {
      setMeets([...meets, meetupdatedMeet]);
    } else {
      setMeets(meets.map(
        (meet) => (meet.id === meetupdatedMeet.id ? meetupdatedMeet : meet),
      ));
    }
    setSelectedMeet(null); // Close the form after saving
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (!selectedMeet) {
        onClose(null);
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
  if (error) {
    return (
      <p className="no-data">
        Chyba:
        {error}
      </p>
    );
  }
  return (
    <div className={`floating-layer ${!firmId ? 'hidden' : ''}`}>
      <button className="close-button" type="button" onClick={onSave}>X</button>
      {selectedMeet ? (
        <EditMeetForm meet={selectedMeet} onSave={handleSave} onClose={handleClose} firmName={firmName.split('/(kont)')[0]} />
      ) : (
        <table className="responsive-table">
          <caption><h3>{`${firmName.split('/(kont)')[0]} - schůzky`}</h3></caption>
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
      )}
    </div>
  );
};

export default MeetList;

MeetList.propTypes = {
  firmId: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  firmName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
