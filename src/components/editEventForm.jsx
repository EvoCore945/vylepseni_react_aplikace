/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Notification from './notification';
import { useUrl } from './UrlProvider';
import { convertToMySQLDatetime } from '../utils/czechdates';

const EditEventForm = () => {
  const { apiUrl } = useUrl();
  const { id, eventId } = useParams();
  const navigate = useNavigate();
  const [firms, setFirms] = useState([]);

  const firmIdNum = useMemo(() => {
    if (!id) {
      return 0;
    }
    return Number(id);
  }, [id]);

  const eventIdValue = useMemo(() => {
    if (!eventId) {
      return null;
    }
    if (eventId === 'new') {
      return null;
    }
    const n = Number(eventId);
    if (Number.isNaN(n)) {
      return null;
    }
    return n;
  }, [eventId]);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const [formData, setFormData] = useState({
    id: -1,
    firm_id: firmIdNum,
    name: '',
    description: '',
    time_start: '',
  });

  // Pokud se změní firma v URL, u create módu uprav firm_id
  useEffect(() => {
    setFormData((prev) => {
      if (eventIdValue !== null) {
        return prev;
      }
      return {
        ...prev,
        firm_id: firmIdNum,
      };
    });
  }, [firmIdNum, eventIdValue]);

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const res = await axios.get(`${apiUrl}firms/list`);
        const cleaned = (res.data || []).map((firm) => ({
          ...firm,
          // stejné "očištění" názvu jako v editCampaignForm.jsx
          name: firm.name ? firm.name.split('/(kont)')[0] : firm.name,
        }));
        setFirms(cleaned);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error fetching firms:', e);
      }
    };
    fetchFirms();
  }, [apiUrl]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (eventIdValue === null) {
        // create mód -> nic nenačítáme
        setLoadError(null);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        // POŽADAVEK: url bude /event/id
        const res = await axios.get(`${apiUrl}event/${eventIdValue}`);
        const ev = res.data[0];
        console.log(res.data);

        setFormData({
          id: Number(ev.id),
          firm_id: ev.firm_id ?? firmIdNum,
          name: ev.name ?? '',
          description: ev.description ?? '',
          time_start: ev.time_start ?? '',
        });
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [apiUrl, eventIdValue, firmIdNum]);

  const showErrorsMessage = () => {
    setIsErrorVisible(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFirmSelectChange = (e) => {
    const selectedId = Number(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      firm_id: selectedId,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firm_id || Number.isNaN(Number(formData.firm_id))) {
      setIsErrorVisible(true);
      return;
    }

    const endpoint = `${apiUrl}events/`;
    const method = formData.id > 0 ? 'put' : 'post';

    const updatedFormData = {
      ...formData,
      time_start: convertToMySQLDatetime(formData.time_start),
    };

    axios({
      method,
      url: endpoint,
      data: updatedFormData,
    })
      .then((response) => {
        if (response.data?.id !== undefined) {
          navigate(`/events/${updatedFormData.firm_id}`);
          return;
        }

        if (response.data?.msg !== undefined) {
          if (response.data.msg === true) {
            navigate(`/events/${updatedFormData.firm_id}`);
          } else {
            showErrorsMessage();
          }
          return;
        }

        showErrorsMessage();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error submitting form:', error);
        showErrorsMessage();
      });
  };

  if (loading) {
    return <p>Načítání události...</p>;
  }

  if (loadError) {
    return (
      <p>
        Chyba načítání:
        {' '}
        {loadError}
      </p>
    );
  }
  const firmOptionLabel = (f) => {
    const addr = [f.street, f.city, f.zip].filter(Boolean).join(', ');
    return [f.name || '', addr].filter(Boolean).join(' — ') || `ID: ${f.id}`;
  };
  return (
    <>
      <h4>
        {formData.id > 0 ? 'Upravit ' : 'Přidat '}
        událost
      </h4>

      {isErrorVisible ? (
        <Notification message="Uložení selhalo" type="edit-firm-error" />
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="hidden">
          <label>ID</label>
          <input
            name="id"
            value={formData.id}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div>
          <label>Firma</label>
          <select
            name="firm_id"
            value={Number(formData.firm_id) || 0}
            onChange={handleFirmSelectChange}
            required
          >
            {/* prázdná volba, pokud by URL ani event nedaly validní ID */}
            <option value={0} disabled>
              — Vyber firmu —
            </option>
            {firms.map((f) => (
              <option key={f.id} value={Number(f.id)}>
                {firmOptionLabel(f)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Název</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Datum a čas</label>
          <input
            name="time_start"
            type="datetime-local"
            value={formData.time_start}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Popis</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Uložit</button>
      </form>
    </>
  );
};

export default EditEventForm;
