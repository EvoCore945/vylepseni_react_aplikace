/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const HideColm = () => {
  const { apiUrl } = useUrl();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [msg, setMsg] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  useEffect(() => {
    // Načtení dat z URL
    axios.get(`${apiUrl}columns`)
      .then((response) => {
        setFormData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setIsErrorVisible(error);
        console.error('Chyba čtení dat:', error);
        setLoading(false);
      });
  }, []);

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post(`${apiUrl}columns`, formData)
      .then((response) => {
        // console.log('Data submitted successfully:', response.data);
        setIsSuccessVisible(true);
        setMsg(response);
      })
      .catch((error) => {
        setIsErrorVisible(true);
        setMsg(error);
      });
  };

  if (loading) {
    return <div>Načítám data...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {isSuccessVisible && (<Notification message="Uloženo" type="edit-firm-success" />)}
      {isErrorVisible && (<Notification message={`Chyba při ukládání! ${msg}`} type="edit-firm-error" />)}
      <table>
        <thead>
          <tr>
            <th>Sloupec</th>
            <th>Viditelnost</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(formData).map(([key, value]) => (
            <tr key={key}>
              <td>
                <label htmlFor={key}>{key}</label>
              </td>
              <td>
                {/* eslint-disable-line jsx-a11y/label-has-associated-control */}
                <input
                  type="checkbox"
                  name={key}
                  id={key}
                  checked={value === true}
                  onChange={handleChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="submit">Uložit</button>
    </form>
  );
};

export default HideColm;
