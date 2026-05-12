/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const EditGiftForm = ({ gift, onSave, onClose }) => {
  console.log(gift);
  const { apiUrl } = useUrl();
  const [formData, setFormData] = useState({
    id: gift.id,
    firm_id: gift.firm_id,
    date: gift.date,
    price: gift.price,
    notes: gift.notes,
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
    const url = `${apiUrl}gifts/`;
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
        } else if (response.data.msg !== undefined) {
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
        showErrorsMessage();
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
        dar
      </h2>
      <button className="close-button" type="button" onClick={onClose}>X</button>
      {isErrorVisible && (<Notification message="Chyba při ukládání!" type="edit-firm-error" />)}
      <div className="hidden">
        <label htmlFor="id">ID</label>
        <input type="hidden" id="id" name="id" value={formData.id} readOnly />
      </div>
      <div className="hidden">
        <label htmlFor="firm_id">firm_id</label>
        <input type="text" id="firm_id" name="firm_id" value={formData.firm_id} readOnly />
      </div>
      <div>
        <label htmlFor="date">Datum</label>
        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="price">Hodnota</label>
        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="notes">Shrnutí</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

export default EditGiftForm;

EditGiftForm.propTypes = {
  gift: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firm_id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
