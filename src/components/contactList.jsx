/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import EditContactForm from './editContactForm';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const ContactList = ({
  firmId, firmName, onClose, onSave,
}) => {
  const { apiUrl } = useUrl();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${apiUrl}contacts/${firmId}`);
        if (Array.isArray(response.data) && response.data.length === 0
        && response.data.msg !== undefined) {
          setError('Žádné kontakty.');
        } else {
          console.log(response.data);
          setContacts(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [firmId, selectedContact]);

  const deleteContact = async (contactId) => {
    try {
      const response = await axios.delete(`${apiUrl}contacts/${contactId}`);
      if (response.status === 200) {
        setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId));
      } else {
        setError('Smazání kontaktu selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setSelectedContact(null);
  };

  const handledelClick = (contact) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteContact(contact.id);
    }
  };
  const handleEditClick = (contact) => {
    console.log(contact);
    setSelectedContact(contact);
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (!selectedContact) {
        onClose(null);
      }
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedContact]);

  const handleSave = (updatedContact) => {
    setContacts(contacts.map(
      (contact) => (contact.id === updatedContact.id ? updatedContact : contact),
    ));
    setSelectedContact(null); // Close the form after saving
    onSave();
  };

  const handleCopy = (inputValue) => {
    navigator.clipboard.writeText(inputValue).then(() => {
      setMsg('Zkopírováno!');
    }).catch((err) => {
      setError('Chyba při kopírování: ', err);
    });
  };

  const Clipboard = (formData) => {
    console.log(formData);
    const formattedString = formData.filter((item) => item).join(', ');
    handleCopy(formattedString);
  };

  if (loading) {
    return <p className="no-data">Načítám...</p>;
  }
  if (error) {
    return (
      <p className="no-data">
        Error:
        {error}
      </p>
    );
  }
  return (
    <div className={`floating-layer ${!firmId ? 'hidden' : ''}`}>
      {msg && (<Notification message={msg} type="edit-firm-success" />)}
      {error && (<Notification message={error} type="edit-firm-error" />)}
      {selectedContact ? (
        <EditContactForm
          contact={selectedContact}
          onSave={handleSave}
          onClose={handleClose}
          firmName={firmName}
        />
      ) : (
        <>
          <button className="close-button" type="button" onClick={onClose}>X</button>
          <table className="responsive-table">
            <caption><h3>{`${firmName.split('/(kont)')[0]} - kontakty`}</h3></caption>
            <thead>
              <tr>
                <th>Hlavní</th>
                <th>Aktivní</th>
                <th>Foto</th>
                <th>Jméno</th>
                <th>E-mail</th>
                <th>Telefon</th>
                <th>LinkedIN</th>
                <th />

              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td data-label="Hlavní">{contact.main === '1' ? '\u2705' : '\u2610'}</td>
                  <td data-label="Aktivní">{contact.active_c === '1' ? '\u2705' : '\u2610'}</td>
                  <td data-label="Foto"><img src={contact.img} alt="" className="kontakt-img" /></td>
                  <td data-label="Jméno">{contact.surname}</td>
                  <td data-label="E-mail"><a href={`${contact.mailto.replace(/\+/g, ' ')}`}>{contact.email}</a></td>
                  <td data-label="Telefon"><a href={`tel:${contact.phone}`}>{contact.phone}</a></td>
                  <td data-label="LinkedIN">{ contact.linkedin ? (<a href={`${contact.linkedin}`}>LinkedIN</a>) : '\u00A0'}</td>
                  <td>
                    <button type="button" onClick={() => handleEditClick(contact)}>upravit</button>
                    <button type="button" onClick={() => handledelClick(contact)} className="del-btn">smazat</button>
                    <button type="button" onClick={() => Clipboard([contact.surname, contact.email, contact.phone, contact.linkedin])} className="fn-btn">Kontakt do schránky</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td><button type="button" onClick={() => handleEditClick({ id: null, firm_id: firmId, main: !contacts.filter((contact) => contact.main === '1').length })}>Přidat kontakt</button></td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ContactList;

ContactList.propTypes = {
  firmId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  firmName: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};
