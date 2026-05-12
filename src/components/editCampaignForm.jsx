/* eslint-disable jsx-a11y/label-has-associated-control */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MultiSelect from './multiselect';
import { useUrl } from './UrlProvider';

const CampaignForm = () => {
  const { apiUrl } = useUrl();
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState({
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
    axios.get(`${apiUrl}firms/list`)
      .then((response) => {
        const cleanedData = response.data.map((firm) => ({
          ...firm,
          name: firm.name.split('/(kont)')[0],
        }));
        setFirms(cleanedData);
      })
      .catch((error) => console.error('Error fetching firms:', error));

    if (id) {
      axios.get(`${apiUrl}campaign/${id}`)
        .then((response) => {
          setCampaign(response.data);
        })
        .catch((error) => console.error('Error fetching campaign:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    console.log(e);

    const {
      name, type, value, options,
    } = e.target;
    console.log(options);
    if (type === 'select-multiple') {
      const selectedValues = Array.from(options)
        .filter((option) => option.value !== 'main_recipient_id') // Remove main_recipient_id
        .map((option) => option);
      console.log(selectedValues);
      setCampaign((prevState) => ({
        ...prevState,
        [name]: selectedValues,
        recipient_count: options.length,
      }));
    } else {
      setCampaign((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    console.log(campaign);
    e.preventDefault();
    const method = id ? 'put' : 'post';
    const url = id ? `${apiUrl}/campaigns/${id}` : `${apiUrl}/campaigns/`;
    axios({
      method,
      url,
      data: campaign,
    })
      .then(() => navigate('/campaign'))
      .catch((error) => console.error('Error saving campaign:', error));
  };
  console.log(campaign);

  return (
    <div>
      <h1>{id ? 'Upravit zasílání' : 'vytvořit zasílání'}</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Název:</label>
          <input type="text" name="name" value={campaign.name} onChange={handleChange} required />
        </div>
        <div className="hidden">
          <label>Datum vytvoření:</label>
          <input type="datetime-local" name="created_date" value={campaign.created_date} onChange={handleChange} />
        </div>
        <div>
          <label>Datum odeslání:</label>
          <input type="datetime-local" name="sent_date_time" value={campaign.sent_date_time} onChange={handleChange} />
        </div>
        <div>
          <label>Datum ukončení:</label>
          <input type="date" name="end_date" value={campaign.end_date} onChange={handleChange} />
        </div>
        <div>
          <label>Poslat na hlavní kontakt:</label>
          <input type="number" name="send_main_contact" min="0" max="1" value={campaign.send_main_contact} onChange={handleChange} />
        </div>
        <div>
          <label>Poslat na všechny vedlejší kontakty:</label>
          <input type="number" name="send_other_contact" min="0" max="1" value={campaign.send_other_contact} onChange={handleChange} />
        </div>
        <div>
          <label>Firmy:</label>
          <MultiSelect
            options={firms}
            selectedValues={campaign.main_recipient_id}
            onChange={(values) => handleChange({
              target: {
                name: 'multi-select', type: 'select-multiple', value: 'select-multiple', options: values,
              },
            })}
          />
        </div>
        <div>
          <label>Počet příjemců (firem):</label>
          <input type="number" name="recipient_count" value={campaign.recipient_count} readOnly />
        </div>
        <div>
          <label>Poznámka:</label>
          <textarea name="note" value={campaign.note} onChange={handleChange} />
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
                setCampaign((prev) => ({
                  ...prev,
                  attachment: reader.result.split(',')[1],
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
              <a href={`${apiUrl}campaignAttachment/${campaign.id}`}>
                {campaign.attachment_name}
              </a>
            )}
          </p>
        </div>
        <button type="submit">{id ? 'uložit' : 'Vytvořit'}</button>
      </form>
    </div>
  );
};

export default CampaignForm;
