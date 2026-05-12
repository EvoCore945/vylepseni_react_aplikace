/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import EditPracticeForm from './editPracticeForm';
import Notification from './notification';
import { useUrl } from './UrlProvider';
import { convertDateTimeToCzech } from '../utils/czechdates';

const PracticeList = ({
  firmId, onSave, firmName, onClose,
}) => {
  const { apiUrl } = useUrl();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

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
  }, [firmId]);

  const deletePractice = async (practiceId) => {
    try {
      const response = await axios.delete(`${apiUrl}practices/${practiceId}`);
      if (response.status === 200) {
        setPractices(
          (prevPractices) => prevPractices.filter((practice) => practice.id !== practiceId),
        );
      } else {
        setError('Smazání selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handledelClick = (practice) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    console.log(practice);
    if (confirmed) {
      deletePractice(practice.id);
    }
  };
  const handleEditClick = (practice) => {
    setSelectedPractice(practice);
  };
  const handleClose = () => {
    setSelectedPractice(null);
  };
  const handleSave = (practiceupdatedPractice) => {
    const existingPractice = practices.find(
      (practice) => practice.id === practiceupdatedPractice.id,
    );
    console.log(practiceupdatedPractice);
    console.log(existingPractice);
    setIsSuccessVisible(true);
    if (!existingPractice) {
      setPractices([...practices, practiceupdatedPractice]);
    } else {
      setPractices(practices.map(
        (practice) => (
          practice.id === practiceupdatedPractice.id ? practiceupdatedPractice : practice
        ),
      ));
    }
    setSelectedPractice(null); // Close the form after saving
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (!selectedPractice) {
        onClose(null);
      }
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPractice]);

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
      {isSuccessVisible && (<Notification message="Uloženo" type="edit-firm-success" />)}
      <button className="close-button" type="button" onClick={onSave}>X</button>
      {selectedPractice ? (
        <EditPracticeForm practice={selectedPractice} onSave={handleSave} onClose={handleClose} />
      ) : (
        <table className="responsive-table">
          <caption><h3>{`${firmName.split('/(kont)')[0]} - Praxe`}</h3></caption>
          <thead>
            <tr>
              <th>Datum a čas</th>
              <th>Obor</th>
              <th>Ročník</th>
              <th>Počet žáků</th>
              <th>Poznámka</th>

            </tr>
          </thead>
          <tbody>
            {practices.map((practice) => (
              <tr key={practice.id}>
                <td data-label="Datum a čas">{convertDateTimeToCzech(practice.date_time)}</td>
                <td data-label="Poznámka">{practice.notes}</td>
                <td><button type="button" onClick={() => handleEditClick(practice)}>upravit</button></td>
                <td><button type="button" onClick={() => handledelClick(practice)} className="del-btn">smazat</button></td>
              </tr>
            ))}
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td><button type="button" onClick={() => handleEditClick({ firm_id: firmId })}>Přidat praxi</button></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PracticeList;

PracticeList.propTypes = {
  firmId: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  firmName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
