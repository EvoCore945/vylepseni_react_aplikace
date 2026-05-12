/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const EditColumnForm = ({ column, onSave, onClose }) => {
  console.log(column);
  const { apiUrl } = useUrl();
  const [formData, setFormData] = useState({
    id: column.id || 0,
    name: column.name || '',
    type: column.type || '',
  });
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const showErrorsMessage = () => {
    setIsErrorVisible(true);
  };
  const [hidden, setHidden] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(e.target);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = `${apiUrl}/column/`;
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
          setHidden(true);
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

  return (
    <div className={`floating-layer ${hidden ? 'hidden' : ''}`}>
      <h2>
        {formData.id ? 'Upravit ' : 'Přidat '}
        sloupec
      </h2>
      <button className="close-button" type="button" onClick={onClose}>X</button>
      <form onSubmit={handleSubmit}>
        {isErrorVisible && (<Notification message="Chyba při ukládání!" type="edit-firm-error" />)}
        <div className="hidden">
          <label htmlFor="id">ID</label>
          <input type="hidden" id="id" name="id" value={formData.id} readOnly />
        </div>
        <div className="">
          <label htmlFor="name">Název</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="type">Typ</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} required="required">
            <option value="">---</option>
            <option value="1" selected={formData.type === '1'}>Text</option>
            <option value="2" selected={formData.type === '2'}>Datum</option>
            <option value="3" selected={formData.type === '3'}>číslo</option>
          </select>
        </div>
        <button type="submit">Uložit</button>
      </form>
    </div>
  );
};

export default EditColumnForm;

EditColumnForm.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
