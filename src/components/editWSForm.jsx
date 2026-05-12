/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const EditWSForm = ({ contact, onSave, onClose }) => {
  const { apiUrl } = useUrl();
  const [formData, setFormData] = useState({
    id: contact.id,
    firmId: contact.firmId,
    date: contact.date,
    type: contact.type,
    notes: contact.notes,
  });
  console.log(formData);
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
    const url = `${apiUrl}workshops/`;
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
              console.log('error');
              showErrorsMessage();
            }
          } else {
            console.log('error');
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
        akci
      </h2>
      <button className="close-button" type="button" onClick={onClose}>X</button>
      {isErrorVisible && (<Notification message="Chyba při ukládání!" type="edit-firm-error" />)}
      <div className="hidden">
        <label htmlFor="id">ID</label>
        <input type="hidden" id="id" name="id" value={formData.id} readOnly />
      </div>
      <div className="hidden">
        <label htmlFor="firmId">firmId</label>
        <input type="hidden" id="firmId" name="firmId" value={formData.firmID} readOnly />
      </div>
      <div>
        <label htmlFor="date">Datum</label>
        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="typ">Typ:</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} required="required">
          <option value="">---</option>
          <option value="1" selected={formData.type === '1'}>Přednáška</option>
          <option value="2" selected={formData.type === '2'}>Worskshop</option>
          <option value="3" selected={formData.type === '3'}>Exkurze</option>
          <option value="5" selected={formData.type === '5'}>Svačina</option>
          <option value="4" selected={formData.type === '4'}>Jiné</option>
        </select>
      </div>
      <div>
        <label htmlFor="notes">Pozn.:</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
      </div>
      <button type="submit">Uložit</button>
    </form>
  );
};

export default EditWSForm;

EditWSForm.propTypes = {
  contact: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firmId: PropTypes.string.isRequired,
    date: PropTypes.string,
    type: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
