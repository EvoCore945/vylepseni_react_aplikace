import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useUrl } from './UrlProvider';

const CompanyChart = ({ year = 0 }) => {
  const [fData, setFData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiUrl } = useUrl();
  const y = year;

  useEffect(() => {
    const fetchFData = async () => {
      try {
        const response = await axios.get(`${apiUrl}stats/getTopCompanies/${y}`);
        if (Array.isArray(response.data) && response.data.length === 0
          && response.data.msg !== undefined) {
          setError('Žádná data.');
        } else {
          const tmpdata = Object.keys(response.data).map((key) => ({
            name: key,
            ...response.data[key],
          }));
          setFData(tmpdata);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFData();
  }, [apiUrl, year]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <p>
        Error:
        {error}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={550}>
      <BarChart
        data={fData}
        margin={{
          top: 20, right: 30, left: 0, bottom: 70,
        }}
      >
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend layout="horizontal" verticalAlign="top" align="center" />
        <Bar dataKey="WS" stackId="a" fill="#8884d8" />
        <Bar dataKey="CV" stackId="a" fill="#82ca9d" />
        <Bar dataKey="Schůzky" stackId="a" fill="#ffc658" />
        <Bar dataKey="Dary" stackId="a" fill="#ff8042" />
        <Bar dataKey="Praxe" stackId="a" fill="#8dd1e1" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CompanyChart;

CompanyChart.propTypes = {
  year: PropTypes.number,
};
