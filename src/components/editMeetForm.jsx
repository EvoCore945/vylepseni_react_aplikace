/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const EditMeetForm = ({
  meet, onSave, onClose, firmName,
}) => {
  const { apiUrl } = useUrl();
  const [formData, setFormData] = useState({
    id: meet.id || 0,
    firm_id: meet.firm_id || '',
    date_time: meet.date_time || '',
    notes: meet.notes || '',
  });
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const showErrorsMessage = () => {
    setIsErrorVisible(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = `${apiUrl}/meets/`;
    const method = formData.id > 0 ? 'put' : 'post';
    console.log(formData);
    axios({
      method,
      url,
      data: formData,
    })
      .then((response) => {
        console.log(response.data);
        if (response.data.id !== undefined) {
          onSave(formData);
        } else
          if (response.data.msg !== undefined) {
            if (response.data.msg === true) {
              onSave(formData);
            } else {
              showErrorsMessage();
            }
          } else {
            showErrorsMessage();
          }
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        // showErrorsMessage();
      });
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose(null);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <h2>
        {formData.id ? 'Upravit ' : 'Přidat '}
        schůzku
        {` - ${firmName}`}
      </h2>
      <button className="close-button" type="button" onClick={onClose}>X</button>
      {isErrorVisible && (<Notification message="Chyba při ukládání!" type="edit-firm-error" />)}
      <div className="hidden">
        <label htmlFor="id">ID</label>
        <input type="hidden" id="id" name="id" value={formData.id} readOnly />
      </div>
      <div className="hidden">
        <label htmlFor="firm_id">Firma</label>
        <input type="hidden" id="firm_id" name="firm_id" value={formData.firm_id} readOnly />
      </div>
      <div>
        <label htmlFor="date_time">Datum a čas</label>
        <input type="datetime-local" id="date_time" name="date_time" value={formData.date_time} onChange={handleChange} min="0" max="1" required />
      </div>
      <div>
        <label htmlFor="notes">Shrnutí</label>
        <textarea id="notes" name="notes" value={formData.notes} min="0" max="1" onChange={handleChange} required />
      </div>
      <button type="submit">Uložit</button>
    </form>
  );
};

export default EditMeetForm;

EditMeetForm.propTypes = {
  meet: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firm_id: PropTypes.string.isRequired,
    date_time: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  firmName: PropTypes.string,
};
