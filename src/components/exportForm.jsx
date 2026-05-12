import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const ExportForm = () => {
  const { apiUrl } = useUrl();
  const [visibleSection, setVisibleSection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState('');
  const [columns, setSelectedColumns] = useState({});
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [fields, setFields] = useState({
    IT: true,
    eleit: true,
    ele: true,
  });
  const [params, setParams] = useState({
    Hlavnikontakt: true,
    Aktivni: true,
    Neaktivni: false,
    Vokativ: true,
    Vsechnyvedlejsi: false,
    cp1250: false,
    google: false,
  });
  const setAllcolumnsFalse = () => {
    setSelectedColumns((prevState) => {
      const updatedParams = {};
      for (const key in prevState) {
        if (Object.prototype.hasOwnProperty.call(prevState, key)) {
          updatedParams[key] = false;
        }
      }
      return updatedParams;
    });
  };

  useEffect(() => {
    // Načtení dat z URL
    axios.get(`${apiUrl}columns`)
      .then((response) => {
        setSelectedColumns(response.data);
        setAllcolumnsFalse();
        setLoading(false);
      })
      .catch((error) => {
        setSelectedColumns(error);
        console.error('Chyba čtení dat:', error);
        setLoading(false);
      });
  }, []);

  const handleFieldsChange = (event) => {
    const { name, checked } = event.target;
    setFields((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };
  const handleParamsChange = (event) => {
    const { name, checked } = event.target;
    setParams((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };
  const handleColumnsChange = (event) => {
    const { name, checked } = event.target;
    setSelectedColumns((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const toggleSection = () => {
    setVisibleSection(!visibleSection);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFile('');
    const formData = {
      fields,
      params,
      columns,
    };
    try {
      // pro produkty tu musít být jen jedno ../
      const response = await fetch(`${apiUrl}../firms/exportFirmsmailingv2.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      setFile(result.file);
    } catch (e) {
      // console.error('Error:', e);
      setIsErrorVisible(true);
    }
  };

  const setAllcolumnsToggle = () => {
    setSelectedColumns((prevState) => {
      const updatedParams = {};
      for (const key in prevState) {
        if (Object.prototype.hasOwnProperty.call(prevState, key)) {
          updatedParams[key] = !prevState[key];
        }
      }
      return updatedParams;
    });
  };

  if (loading) {
    return <p className="no-data">Načítání dat...</p>;
  }

  return (
    <form className="exportForm" onSubmit={handleSubmit}>
      {isErrorVisible && (<Notification message="Chyba při exportu!" type="edit-firm-error" />)}
      <h2>Export firem a kontaktů</h2>
      <section>
        <legend>Obory činnosti</legend>
        {Object.keys(fields).map((option) => (
          <div key={option}>
            <label htmlFor={option}>
              <input
                type="checkbox"
                id={option}
                name={option}
                checked={fields[option]}
                onChange={handleFieldsChange}
              />
              {option}
            </label>
          </div>
        ))}
      </section>
      <section>
        <legend>Výběr kontaktů</legend>
        {Object.keys(params).map((option) => (
          <div key={option}>
            <label htmlFor={option}>
              <input
                type="checkbox"
                id={option}
                name={option}
                checked={params[option]}
                onChange={handleParamsChange}
              />
              {option}
            </label>
          </div>
        ))}
      </section>
      <button type="button" onClick={() => toggleSection()} className="fn-btn">Vybrat sloupce</button>
      <section className={visibleSection === false ? 'hideSection' : ''}>
        <legend>Výběr sloupů</legend>
        {Object.entries(columns).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key}>
              <input
                type="checkbox"
                name={key}
                id={key}
                checked={columns[key]}
                value={value}
                onChange={handleColumnsChange}
              />
              {key}
            </label>
          </div>
        ))}
        <button type="button" onClick={setAllcolumnsToggle}>Prohodit zaškrtnutí</button>
      </section>
      <br />
      <br />
      <button type="submit">Generovat</button>
      {file && (
        <a href={file} target="_blank" rel="noreferrer">
          Stáhnout
        </a>
      )}
    </form>
  );
};

export default ExportForm;
