import { Chart, ArcElement } from 'chart.js';
import PropTypes from 'prop-types';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

Chart.register(ArcElement);
Chart.defaults.font.family = 'Arial'; // Change to your desired font family
Chart.defaults.font.size = 18; // Change to your desired font size
Chart.defaults.font.style = 'bold'; // Change to your desired font style

const RingChart = ({ rdata, desc }) => {
  const processData = (data) => {
    const labels = [];
    const values = [];

    Object.keys(data).forEach((category) => {
      Object.keys(data[category]).forEach((year) => {
        Object.keys(data[category][year]).forEach((firm) => {
          labels.push(`${category} ${year} ${firm}`);
          values.push(data[category][year][firm]);
        });
      });
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    };
  };
  console.log(rdata);

  const chartData = processData(rdata);

  return (
    <div>
      <h2>{desc}</h2>
      <Doughnut data={chartData} />
    </div>
  );
};

export default RingChart;

RingChart.propTypes = {
  rdata: PropTypes.objectOf(PropTypes.string).isRequired,
  desc: PropTypes.string.isRequired,
};
