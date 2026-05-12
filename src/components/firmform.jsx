import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const EditFirmForm = ({
  firmId, onSave, onClose, handleSaveAfterAddFirm, firmName,
}) => {
  const { apiUrl } = useUrl();
  const [formSchema, setFormSchema] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [firmExist, setFirmExist] = useState('');
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  useEffect(() => {
    let url = `${apiUrl}firms/form`;
    if (firmId > 0) {
      url = `${apiUrl}firms/form/${firmId}`;
    }

    axios.get(url)
      .then((response) => {
        console.log(response.data);
        if (response.data.msg === undefined) {
          console.log(response.data);
          setFormSchema(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch((error) => {
        console.error('Error fetching the JSON data:', error);
      });
  }, []);

  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const showErrorsMessage = () => {
    setIsErrorVisible(true);
  };
  const showSuccessMessage = () => {
    setIsSuccessVisible(true);
  };

  const handleSubmit = (e, submit) => {
    e.preventDefault();
    console.log(submit);
    if (Object.keys(formData).length === 0) {
      return;
    }
    const url = `${apiUrl}firms/`;
    const method = firmId > 0 ? 'put' : 'post';
    const dataToSubmit = { ...formData, id: firmId };
    console.log(formData);

    axios({
      method,
      url,
      data: dataToSubmit,
    })
      .then((response) => {
        console.log(response.data.id);
        if (response.data.id !== undefined) {
          showSuccessMessage();
          setFormData({});

          if (submit === 'sac') {
            handleSaveAfterAddFirm(formData.name);
          } else {
            onSave();
          }
        } else
          if (response.data.msg !== undefined) {
            if (response.data.msg === true) {
              showSuccessMessage();
              setFormData({});
              if (submit === 'sac') {
                handleSaveAfterAddFirm(formData.name);
              } else {
                onSave();
              }
            } else {
              if (response.data.msg.includes('Reader')) {
                setFirmExist('Nemáte práva pro zápis!');
              } else {
                setFirmExist('Firma již existuje!');
              }
              showErrorsMessage();
            }
          } else {
            if (response.data.msg.includes('Reader')) {
              setFirmExist('Nemáte práva pro zápis!');
            }
            showErrorsMessage();
          }
      })
      .catch((error) => {
        console.error('Chyba odesílání fomruláře:', error);
        showErrorsMessage();
      });
  };

  const generateForm = (schema) => (
    schema.map(([name, type, label, hidden, val]) => {
      let inputElement;
      let req = '';
      if (name === 'name') {
        req = 'required';
      } else {
        req = '';
      }

      if (type === 'select') {
        inputElement = (
          <select id={name} name={name} value={val} onChange={handleChange} required="required">
            <option value="">---</option>
            <option value="1">IT</option>
            <option value="2">Ele</option>
            <option value="3">ELE,IT</option>
          </select>
        );
      } else
        if (name === 'note') {
          inputElement = (
            <textarea
              id={name}
              name={name}
              onChange={handleChange}
              value={formData[name] ?? val ?? ''}
              required={req}
            />
          );
        } else {
          let inputType = 'text';
          if (type === 'number') {
            inputType = 'number';
          }
          if (type === 'date') {
            inputType = 'date';
          }

          inputElement = (
            <input
              id={name}
              type={inputType}
              name={name}
              onChange={handleChange}
              value={formData[name] ?? val ?? ''}
              required={req}
              readOnly={name === 'id' ? true : undefined}
            />
          );
        }
      return (
        <div key={name} className={hidden && !isVisible ? 'hidden' : 'item'}>
          <label htmlFor={name}>{label}</label>
          {inputElement}
        </div>
      );
    })
  );
  return (
    <>
      {isSuccessVisible && (<Notification message="Uloženo" type="edit-firm-success" />)}
      {isErrorVisible && (<Notification message={`Chyba při ukládání! ${firmExist}`} type="edit-firm-error" />)}
      <div className={`floating-layer ${!firmId ? 'hidden' : ''}`}>
        <form onSubmit={handleSubmit} className="firmform">
          <h2>
            {firmId > 0 ? 'Upravit ' : 'Přidat '}
            firmu
            {` ${firmName?.split('/(kont)')[0] || ''} `}
          </h2>
          <button className="close-button" type="button" onClick={onClose}> X </button>
          {generateForm(formSchema)}
          <button type="submit">Uložit</button>
          <button type="submit" onClick={(event) => handleSubmit(event, 'sac')}>Uložit a zobrazit firmu</button>
          <button type="button" onClick={toggleVisibility} className="fn-btn">
            {isVisible ? 'skrýt ' : 'zobrazit '}
            položky
          </button>
        </form>
      </div>
    </>
  );
};

export default EditFirmForm;

EditFirmForm.propTypes = {
  firmId: PropTypes.number,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  handleSaveAfterAddFirm: PropTypes.func,
  firmName: PropTypes.string,
};
