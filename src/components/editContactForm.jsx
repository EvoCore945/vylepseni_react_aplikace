/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import FileUpload from './fileUpload';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const EditContactForm = ({
  contact, onSave, firmName, onClose,
}) => {
  const { apiUrl } = useUrl();
  const [formData, setFormData] = useState({
    id: contact.id,
    firm_id: contact.firm_id,
    // main: contact.id !== null ? (contact.main || 0) : 1,
    // main: contact.main !== undefined ? contact.main === '1' : false,
    main: contact.main,
    active_c: contact.active_c !== undefined ? contact.active_c === '1' : true,
    surname: contact.surname || '',
    email: contact.email || '',
    phone: contact.phone || '',
    mailto: contact.mailto || '',
    img: contact.img || '',
    linkedin: contact.linkedin || '',
    gender: contact.gender || '',
  });
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [changeFirmId, setChangeFirmId] = useState(true);

  const showErrorsMessage = () => {
    setIsErrorVisible(true);
  };
  const handleChangeFirmId = () => {
    setChangeFirmId(!changeFirmId);
  };

  const handleChange = (e) => {
    const {
      name, value, type, checked,
    } = e.target;
    console.log(name);
    if (name === 'surname') {
      const regex = /(.*) <(.*)>/;
      const matches = value.match(regex);

      if (matches) {
        setFormData({
          ...formData,
          surname: matches[1],
          email: matches[2],
        });
      } else {
        setFormData({
          ...formData,
          [name]: type === 'checkbox' ? checked : value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = `${apiUrl}contacts/`;
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
        showErrorsMessage();
      });
  };

  const setFile = (file) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      img: file,
    }));
    console.log(file);
    console.log(formData);
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
      <h3>
        {formData.id ? 'Upravit ' : 'Přidat '}
        kontakt
      </h3>
      <button className="close-button" type="button" onClick={onClose}>X</button>
      <h2>{firmName}</h2>
      {isErrorVisible && (<Notification message="Chyba při ukládání!" type="edit-firm-error" />)}
      <div className="hidden">
        <label htmlFor="id">ID</label>
        <input type="hidden" id="id" name="id" value={formData.id} readOnly />
      </div>
      <div className="">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <label htmlFor="firm_id" onClick={handleChangeFirmId} onKeyDown={() => {}}>{'\u270E ID firmy'}</label>
        <input type="text" id="firm_id" name="firm_id" value={formData.firm_id} onChange={handleChange} className={changeFirmId ? 'hidden' : ''} />
      </div>
      <div>
        <label htmlFor="main">Hlavní</label>
        <input type="checkbox" id="main" name="main" checked={formData.main} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="active_c">Aktivní</label>
        <input type="checkbox" id="active_c" name="active_c" checked={formData.active_c} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="img">Foto</label>
        <div className="file-upload">
          {formData.img === '' ? '' : (<img src={formData.img} alt="foto" className="foto-thumb" />)}
          <input type="text" id="img" name="img" value={formData.img} onChange={handleChange} />
          <FileUpload setFile={setFile} />
        </div>
      </div>
      <div>
        <label htmlFor="surname">Jméno</label>
        <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="email">E-mail</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="phone">Telefon</label>
        <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="linkedin">LinkedIn</label>
        <input id="linkedin" name="linkedin" type="text" value={formData.linkedin} onChange={handleChange} />
      </div>
      <div>
        <label htmlFor="gender">Oslovovat jako</label>
        <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">---</option>
          <option value="muž">Muže</option>
          <option value="žena">ženu</option>
          <option value="jiné">nepřechylovat</option>
        </select>
      </div>
      <button type="submit">Uložit</button>

    </form>
  );
};

export default EditContactForm;

EditContactForm.propTypes = {
  contact: PropTypes.shape({
    id: PropTypes.string,
    firm_id: PropTypes.string.isRequired,
    main: PropTypes.string,
    active_c: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
    img: PropTypes.string,
    mailto: PropTypes.string,
    phone: PropTypes.string,
    linkedin: PropTypes.string,
    gender: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  firmName: PropTypes.string.isRequired,
};
