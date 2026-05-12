/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUrl } from './UrlProvider';
import isSmall from '../utils/mobileDetect';

const getFirstPart = (text) => {
  const parts = text?.split(/\/\(kont\)/) || [];
  return parts[0];
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const { apiUrl, user } = useUrl();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isWrapped, setIsWrapped] = useState(false);

  const toggleWrap = () => {
    setIsWrapped(!isWrapped);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      console.log('fetchContacts');

      try {
        const response = await axios.get(`${apiUrl}/campaigns/`);
        if (Array.isArray(response.data) && response.data.length === 0
          && response.data.msg !== undefined) {
          setError('Žádné kontakty.');
        } else {
          console.log(response.data);
          setCampaigns(response.data);
        }
      } catch (err) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [apiUrl]);

  const handleEditClick = (campaign) => {
    navigate(`/campaignAdd/${campaign.id}`);
  };
  const deleteCampaign = async (firmId) => {
    try {
      const response = await axios.delete(`${apiUrl}campaign/${firmId}`);
      if (response.status === 200) {
        // fetchData();
        setCampaigns((prevFirm) => prevFirm.filter((firm) => firm.id !== firmId));
      } else {
        setError('Smazání kontaktu selhalo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelClick = (id) => {
    const confirmed = window.confirm('Chceš to fakt vymazat?');
    if (confirmed) {
      deleteCampaign(id);
    }
  };
  const handleClick = (id) => {
    navigate(`/getCampaignContacts/${id}`);
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
    <div>
      <h1>Zasílání</h1>
      <table className={`responsive-table ${isWrapped ? 'wrap-cells' : 'nowrap-cells'}`}>
        <thead>
          <tr>
            <th>
              ID
              <span
                onClick={toggleWrap}
                style={{ cursor: 'pointer', fontSize: '1.2em, padding-left:1em' }}
                title="Přepnout zalamování textu"
              >
                🔁
              </span>
            </th>
            <th>Název</th>
            <th>Datum Vytvoření</th>
            <th>Datum odeslání</th>
            <th>Datum ukončení</th>
            <th>Počet adresátů (firem)</th>
            <th>Počet nedoručení</th>
            <th>Počet potvrzení o doručení</th>
            <th>Odpovědělo</th>
            <th>Poznámka</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>{campaign.id}</td>
              <td
                onClick={() => handleClick(campaign.id)}
              >
                {getFirstPart(campaign.name)}
              </td>
              <td>{campaign.created_date}</td>
              <td>{campaign.sent_date_time}</td>
              <td>{campaign.end_date}</td>
              <td>{campaign.recipient_count}</td>
              <td>{campaign.undelivered_count}</td>
              <td>{campaign.confirmed_received_count}</td>
              <td>{campaign.replied_count}</td>
              <td>{campaign.note}</td>
              <td>
                {user.user !== 'reader' ? (
                  <div>
                    <div className={isSmall() ? 'small-resolution' : ''}>
                      <button type="button" onClick={() => handleEditClick(campaign)}>upravit</button>
                      <button type="button" onClick={() => handleDelClick(campaign.id)} className="del-btn">smazat</button>
                      <a href={`${apiUrl}campaignExport/${campaign.id}/?csvexport`} id="csv_export">CSV export</a>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignList;
