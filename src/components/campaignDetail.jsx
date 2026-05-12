import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    axios.get(`/api/campaigns/${id}`)
      .then(response => setCampaign(response.data))
      .catch(error => console.error('Error fetching campaign:', error));
  }, [id]);

  if (!campaign) return <div>Loading...</div>;

  return (
    <div>
      <h1>{campaign.name}</h1>
      <p>Created Date: {campaign.created_date}</p>
      <p>Sent Date: {campaign.sent_date_time}</p>
      <p>Recipient Count: {campaign.recipient_count}</p>
      <p>Undelivered: {campaign.undelivered_count}</p>
      <p>Confirmed Received: {campaign.confirmed_received_count}</p>
      <p>Replied: {campaign.replied_count}</p>
      <p>Note: {campaign.note}</p>
    </div>
  );
};

export default CampaignDetail;
