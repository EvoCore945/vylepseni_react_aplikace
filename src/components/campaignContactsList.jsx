/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FancyCheckbox from './fancyCheckbox';
import Notification from './notification';
import { useUrl } from './UrlProvider';

const CampaignContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiUrl, url: EUrl } = useUrl();
  const { id } = useParams();
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  let masterLabel = '';
  const areNoneSelected = selectedContacts.length === 0;

  const areAllSelected = useMemo(() => {
    if (contacts.length === 0) {
      return false;
    }
    const allIds = contacts.map((c) => c.contact_id);
    return allIds.every((cid) => selectedContacts.includes(cid));
  }, [contacts, selectedContacts]);

  if (areAllSelected) {
    masterLabel = 'Zrušit výběr všech';
  } else if (areNoneSelected) {
    masterLabel = 'Vybrat všechny';
  } else {
    masterLabel = 'Invertovat výběr';
  }

  const areSomeSelected = !areNoneSelected && !areAllSelected; // pro indeterminate
  // Pomocná funkce – je kontakt bez odpovědi?
  const isNoReply = (contact) => {
    const s = (contact.status || '').trim();
    const sc = (contact.status_from_cron || '').trim();
    return s === '' && sc === '';
  };

  // Vybrat všechny bez odpovědi
  const selectNoReplyContacts = () => {
    const ids = contacts.filter(isNoReply).map((c) => c.contact_id);
    setSelectedContacts(ids);
  };

  const toggleMaster = () => {
    if (areAllSelected) {
      // Vše vybrané → zrušit výběr
      setSelectedContacts([]);
    } else if (areNoneSelected) {
      // Nic vybrané → vybrat vše
      const allIds = contacts.map((c) => c.contact_id);
      setSelectedContacts(allIds);
    } else {
      // Částečný výběr → invertovat výběr (toggle vybraného)
      const allIdsSet = new Set(contacts.map((c) => c.contact_id));
      const selectedSet = new Set(selectedContacts);
      const inverted = Array.from(allIdsSet).filter((cId) => !selectedSet.has(cId));
      setSelectedContacts(inverted);
    }
  };

  const exportSelectedToApi = async () => {
    if (selectedContacts.length === 0) {
      alert('Nejsou vybrané žádné kontakty.');
      return;
    }

    try {
      await axios.post(`${EUrl}/rest.php/getCampaignSeindingExport/71/?csvexport`, {
        contact_ids: selectedContacts,
      });
    } finally {
      const random = Math.floor(Math.random() * 1_000_000);
      const baseUrl = `${EUrl}csvexport.csv?rand=${random}`;
      console.log(baseUrl);
      window.open(baseUrl);
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${apiUrl}getCampaignContacts/${id}`);
        if (Array.isArray(response.data)) {
          setContacts(response.data);
        } else {
          setIsErrorVisible(error);
          setError('Neplatná odpověď ze serveru.');
        }
      } catch (err) {
        setIsErrorVisible(error);
        setError(`Chyba při načítání: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [id, isSuccessVisible]);

  const handleCheckboxChange = (contactId) => {
    console.log(contactId);
    setSelectedContacts((prevContacts) => {
      const updatedContacts = prevContacts.includes(contactId)
        ? prevContacts.filter((existingId) => existingId !== contactId)
        : [...prevContacts, contactId];

      return updatedContacts;
    });
  };
  const selectEmptyStatusContacts = () => {
    const emptyStatusIds = contacts
      .filter((contact) => !contact.status || contact.status.trim() === '')
      .map((contact) => contact.contact_id);

    setSelectedContacts(emptyStatusIds);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleBulkUpdate = () => {
    if (!newStatus || selectedContacts.length === 0) {
      alert('Vyberte kontakty a status.');
      return;
    }
    setNewStatus('');
    const url = `${apiUrl}campaignContacts/${id}`;
    const data = {
      campaign_id: id,
      contact_ids: selectedContacts,
      status: newStatus,
    };

    axios({
      method: 'post',
      url,
      data,
    })
      .then((response) => {
        console.log(response.data.msg);
        if (response.data.msg === true) {
          setIsSuccessVisible(true);
          console.log('překe');
          setSelectedContacts([]);
          // Volitelně: fetchContacts(); pokud chceš znovu načíst data
        } else {
          console.log('Chyba v odpovědi');
          setIsErrorVisible(true);
        }
      })
      .catch((er) => {
        console.error('Chyba při ukládání:', er);
        setIsErrorVisible(true);
      });
  };
  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) {
      return;
    }

    const confirmDelete = window.confirm('Opravdu chcete smazat vybrané kontakty?');
    if (!confirmDelete) {
      return;
    }

    const url = `${apiUrl}campaignContacts/${id}`; // uprav podle svého API
    const data = {
      campaign_id: id,
      contact_ids: selectedContacts,
    };

    axios({
      method: 'delete', // nebo 'delete' podle backendu
      url,
      data,
    })
      .then((response) => {
        if (response.data.msg === true) {
          setIsSuccessVisible(true);
          setSelectedContacts([]);
          setContacts((prevContacts) => prevContacts.filter(
            (contact) => !selectedContacts.includes(contact.contact_id),
          ));
        } else {
          setIsErrorVisible(true);
        }
      })
      .catch((err) => {
        console.error('Chyba při mazání:', err);
        setIsErrorVisible(true);
      });
  };

  if (loading) {
    return <p>Načítání...</p>;
  }
  if (error) {
    return (
      <p>
        Chyba:&nbsp;
        {error}
      </p>
    );
  }
  return (
    <>
      {isSuccessVisible && (<Notification message="Uloženo" type="edit-firm-success" />)}
      {isErrorVisible && (<Notification message="Chyba při ukládání!" type="edit-firm-error" />)}
      <div
        className="campaign-toolbar"
        style={{
          position: 'fixed', top: 58, left: 10, width: '100%', background: 'white',
        }}
      >
        <h3 style={{
          display: 'inline-block', 'margin-right': '1em',
        }}
        >
          Kontakty kampaně #
          {id}
        </h3>
        <select value={newStatus} onChange={handleStatusChange} className="campaign-select">
          <option value="">-- Změnit status na --</option>
          <option value="doručeno">Doručeno</option>
          <option value="nedoručeno">Nedoručeno</option>
          <option value="nemá zájem">Nemá zájem</option>
          <option value="později">Později</option>
          <option value="ozvou se">Ozvou se</option>
          <option value="bude schůzka/hovor">Bude schůzka/hovor</option>
          <option value="pasívní spolupráce">Pasívní spolupráce</option>
          <option value="aktivní spolupráce">Aktivní spolupráce</option>
          <option value="poslat znovu">Poslat znovu</option>
          <option value="Účastní se">Účastní se</option>
        </select>
        <button
          type="button"
          onClick={handleBulkUpdate}
          style={{ marginLeft: '1em', height: 48 }}
        >
          Aktualizovat vybrané
        </button>
        <button
          type="button"
          onClick={selectEmptyStatusContacts}
          style={{ marginLeft: '1em', height: 48 }}
        >
          Vybrat bez statusu
        </button>
        <button
          type="button"
          onClick={handleBulkDelete}
          style={{
            marginLeft: '1em',
            height: 48,
            backgroundColor: '#e74c3c',
            color: 'white',
          }}
        >
          Smazat vybrané
        </button>

        <button
          type="button"
          onClick={selectNoReplyContacts}
          style={{ marginLeft: '1em', height: 48 }}
        >
          Vybrat bez odpovědi
        </button>

        <button
          type="button"
          onClick={exportSelectedToApi}
          style={{
            marginLeft: '1em', height: 48, backgroundColor: '#8e44ad', color: 'white',
          }}
        >
          Export vybraných
        </button>

      </div>

      <table className="responsive-table" style={{ 'margin-top': 70 }}>
        <thead>
          <tr>
            <th>
              <FancyCheckbox
                indeterminate={areSomeSelected}
                onChange={toggleMaster}
                ariaLabel={masterLabel}
                id="master"
                name="master"
                checked={areAllSelected}
              />

            </th>
            <th>Firma</th>
            <th>Email</th>
            <th>Status</th>
            <th>Status z cronu</th>
            <th>Aktualizace</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.contact_id}>
              <td>
                <FancyCheckbox
                  id={contact.contact_id}
                  name={contact.contact_id}
                  checked={selectedContacts.includes(contact.contact_id)}
                  onChange={() => handleCheckboxChange(contact.contact_id)}
                  ariaLabel={`Vybrat kontakt ${contact.contact_id}`}
                >
                  {/*  viditelný text */}
                </FancyCheckbox>
              </td>

              <td>
                <Link
                  to={`/firm/${encodeURIComponent(contact.firm_name || contact.name || '')}`}
                  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'inherit' }}
                >
                  {contact.name || `${contact.surname || ''}`}
                </Link>
              </td>

              <td>{contact.email}</td>
              <td>{contact.status || '—'}</td>
              <td>{contact.status_from_cron || '—'}</td>
              <td>{contact.datum_aktualizace || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default CampaignContactsList;
