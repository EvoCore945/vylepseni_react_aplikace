/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MultiSelect from './multiselect';
import { useUrl } from './UrlProvider';

const CampaignForm = () => {
  const { apiUrl } = useUrl();
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState({
    id: null,
    name: '',
    created_date: '',
    sent_date_time: '',
    end_date: '',
    send_main_contact: 1,
    send_other_contact: 0,
    main_recipient_id: [],
    secondary_recipient_ids: '',
    recipient_count: 0,
    undelivered_count: 0,
    confirmed_received_count: 0,
    replied_count: 0,
    note: '',
    attachment: '',
    attachment_name: '',
  });

  const [firms, setFirms] = useState([]);

  useEffect(() => {
    const cleanApiUrl = apiUrl.replace(/\/$/, '');

    // Nacteni firem
    axios.get(`${cleanApiUrl}/firms/list`)
      .then((response) => {
        const responseData = Array.isArray(response.data)
          ? response.data
          : [];

        const cleanedData = responseData.map((firm) => ({
          ...firm,
          id: String(firm.id),
          name: typeof firm.name === 'string'
            ? firm.name.split('/(kont)')[0]
            : '',
        }));

        setFirms(cleanedData);
      })
      .catch((error) => {
        console.error('Error fetching firms:', error);
      });

    // Pokud editujeme, nacteme existujici kampan
    if (id) {
      axios.get(`${cleanApiUrl}/campaigns/${id}`)
        .then((response) => {
          const data = response.data || {};

          let selectedFirms = data.main_recipient_id;

          if (!Array.isArray(selectedFirms)) {
            selectedFirms = [];
          }

          selectedFirms = selectedFirms.map((firmId) => String(firmId));

          setCampaign((prev) => ({
            ...prev,
            ...data,

            // ID z URL pouzijeme jako jistotu
            id: data.id || id,

            // MultiSelect musi vzdy dostat pole
            main_recipient_id: selectedFirms,

            // Bezpecne hodnoty pro controlled inputs
            name: data.name || '',
            created_date: data.created_date || '',
            sent_date_time: data.sent_date_time || '',
            end_date: data.end_date || '',
            send_main_contact: data.send_main_contact ?? 1,
            send_other_contact: data.send_other_contact ?? 0,
            secondary_recipient_ids: data.secondary_recipient_ids || '',
            recipient_count: data.recipient_count ?? selectedFirms.length,
            undelivered_count: data.undelivered_count ?? 0,
            confirmed_received_count: data.confirmed_received_count ?? 0,
            replied_count: data.replied_count ?? 0,
            note: data.note || '',
            attachment: data.attachment || '',
            attachment_name: data.attachment_name || '',
          }));
        })
        .catch((error) => {
          console.error('Error fetching campaign:', error);
        });
    }
  }, [apiUrl, id]);

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setCampaign((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFirmChange = (values) => {
    const safeValues = Array.isArray(values)
      ? values.map((value) => String(value))
      : [];

    setCampaign((prevState) => ({
      ...prevState,
      main_recipient_id: safeValues,
      recipient_count: safeValues.length,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanApiUrl = apiUrl.replace(/\/$/, '');
    const method = id ? 'put' : 'post';

    const url = id
      ? `${cleanApiUrl}/campaigns/${id}`
      : `${cleanApiUrl}/campaigns`;

    const dataToSend = {
      ...campaign,

      // Pri editaci musi backend dostat ID
      ...(id ? { id } : {}),

      main_recipient_id: Array.isArray(campaign.main_recipient_id)
        ? campaign.main_recipient_id
        : [],

      recipient_count: Array.isArray(campaign.main_recipient_id)
        ? campaign.main_recipient_id.length
        : 0,
    };

    console.log('Odesilam kampan:', dataToSend);

    axios({
      method,
      url,
      data: dataToSend,
    })
      .then((response) => {
        console.log('Kampan ulozena:', response.data);
        navigate('/campaign');
      })
      .catch((error) => {
        console.error('Error saving campaign:', error);
      });
  };

  return (
    <div>
      <h1>
        {id ? 'Upravit zasílání' : 'Vytvořit zasílání'}
      </h1>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div>
          <label>Název:</label>

          <input
            type="text"
            name="name"
            value={campaign.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="hidden">
          <label>Datum vytvoření:</label>

          <input
            type="datetime-local"
            name="created_date"
            value={campaign.created_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Datum odeslání:</label>

          <input
            type="datetime-local"
            name="sent_date_time"
            value={campaign.sent_date_time}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Datum ukončení:</label>

          <input
            type="date"
            name="end_date"
            value={campaign.end_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Poslat na hlavní kontakt:</label>

          <input
            type="number"
            name="send_main_contact"
            min="0"
            max="1"
            value={campaign.send_main_contact}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>
            Poslat na všechny vedlejší kontakty:
          </label>

          <input
            type="number"
            name="send_other_contact"
            min="0"
            max="1"
            value={campaign.send_other_contact}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Firmy:</label>

          <MultiSelect
            options={firms}
            selectedValues={
              Array.isArray(campaign.main_recipient_id)
                ? campaign.main_recipient_id
                : []
            }
            onChange={handleFirmChange}
          />
        </div>

        <div>
          <label>Počet příjemců (firem):</label>

          <input
            type="number"
            name="recipient_count"
            value={campaign.recipient_count}
            readOnly
          />
        </div>

        <div>
          <label>Poznámka:</label>

          <textarea
            name="note"
            value={campaign.note}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Příloha:</label>

          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];

              if (!file) {
                return;
              }

              const reader = new FileReader();

              reader.onload = () => {
                const result = reader.result || '';

                setCampaign((prev) => ({
                  ...prev,
                  attachment: result.includes(',')
                    ? result.split(',')[1]
                    : result,
                  attachment_name: file.name,
                }));
              };

              reader.readAsDataURL(file);
            }}
          />
        </div>

        <div>
          <label>Složený soubor:</label>

          <p style={{ display: 'inline-block' }}>
            {campaign.attachment_name && (
              <a
                href={`${apiUrl.replace(
                  /\/$/,
                  '',
                )}/campaignAttachment/${campaign.id || id}`}
              >
                {campaign.attachment_name}
              </a>
            )}
          </p>
        </div>

        <button type="submit">
          {id ? 'Uložit' : 'Vytvořit'}
        </button>
      </form>
    </div>
  );
};

export default CampaignForm;