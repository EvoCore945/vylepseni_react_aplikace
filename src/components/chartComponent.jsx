import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import CompanyChart from './companyChart';
// import RingChart from './RingChart';
import { useUrl } from './UrlProvider';
import useIsSmall from '../utils/mobileDetect';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const ChartComponent = () => {
  const [data, setData] = useState([]);
  // const [Rdata, setRData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { apiUrl } = useUrl();
  const isSmall = useIsSmall();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}stats/cvcount`);
        if (
          Array.isArray(response.data)
          && response.data.length === 0
          && response.data.msg !== undefined
        ) {
          setError('Žádná data.');
        } else {
          console.log(response.data);
          setData(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // === Auto-generování školních roků (2018 -> současnost) ===
  const getSchoolYears = () => {
    const startYear = 2018;
    const now = new Date();
    let currentYear = now.getFullYear();

    // Pokud je leden–srpen, školní rok ještě nezačal → posun o 1 zpět
    if (now.getMonth() < 8) {
      currentYear -= 1; // místo currentYear--
    }

    const result = [];
    for (let y = currentYear; y >= startYear; y -= 1) { // místo y--
      result.push({
        label: `${y}/${y + 1}`,
        year: y + 1, // tohle používáš v <CompanyChart year={...} />
      });
    }
    return result;
  };
  const schoolYears = getSchoolYears();

  const totalValues = data.map(
    (item) => Number(item.Neadres_E)
      + Number(item.Neadres_A)
      + Number(item.Adres_A)
      + Number(item.Adres_E)
      + Number(item.Neadres_IT)
      + Number(item.Adres_IT),
  );

  console.log(totalValues);

  const chartData = {
    labels: data.map((item, index) => `${item.year} (${totalValues[index]})`),
    datasets: [
      {
        label: 'Neadres. pozvánky obor E',
        data: data.map((item) => item.Neadres_E),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Neadres. pozvánky obor A',
        data: data.map((item) => item.Neadres_A),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Adres. pozvánky obor A',
        data: data.map((item) => item.Adres_A),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Adres. pozvánky obor E',
        data: data.map((item) => item.Adres_E),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Neadres. pozvánky obor IT',
        data: data.map((item) => item.Neadres_IT),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Adres. pozvánky obor IT',
        data: data.map((item) => item.Adres_IT),
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  const optionsSmall = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
        },
      },
      x: {
        stacked: true,
        ticks: {
          font: { size: 12 },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14 },
          padding: 20, // rozestup mezi štítky
          boxWidth: 20,
          usePointStyle: true, // hezčí styl ikonky
        },
      },
      datalabels: {
        anchor: 'center',
        align: 'center',
        formatter: (value, context) => {
          const total = totalValues[context.dataIndex];
          const percentage = `${((value / total) * 100).toFixed(1)}%`;
          return percentage;
        },
        color: 'black',
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: 13,
          },
        },
        beginAtZero: true,
      },
      y: {
        stacked: true,
        ticks: {
          font: {
            size: 13,
          },
        },
      },
    },

    plugins: {
      legend: {
        labels: {
          font: {
            size: 16,
          },
        },
      },
      datalabels: {
        anchor: 'center',
        align: 'center',
        formatter: (value, context) => {
          const total = totalValues[context.dataIndex];
          const percentage = `${((value / total) * 100).toFixed(1)}%`;
          return `${percentage}`;
        },
        color: 'black',
        font: {
          weight: 'bold',
          size: 15,
        },
      },
    },
  };

  useEffect(() => {
    const fetchRData = async () => {
      try {
        const response = await axios.get(`${apiUrl}stats/getStatBySYears`);
        if (
          Array.isArray(response.data)
          && response.data.length === 0
          && response.data.msg !== undefined
        ) {
          setError('Žádná data.');
        } else {
          console.log(response.data);
          // setRData(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRData();
  }, []);

  if (loading) {
    return <p>Načítám...</p>;
  }

  if (error) {
    return (
      <p>
        Error:
        {error}
      </p>
    );
  }

  /*
  const desc = (category) => {
    if (category !== 'WS') {
      return 'Přednášky, Workshop, Exkurze atd.';
    }
    return category;
  };
  */

  return (
    <div>
      <h1>Statistika dle školních let</h1>
      {isSmall ? (
        <div style={{ width: '100%', height: '800px' }}>
          <Bar data={chartData} options={optionsSmall} />
        </div>
      ) : (
        <Bar data={chartData} options={options} height={50} />
      )}
      <hr />

      {schoolYears.map((sy) => (
        <div key={sy.year}>
          <h2>
            Rok
            {' '}
            {sy.label}
          </h2>
          <h3>Nejaktivnější firmy</h3>
          <CompanyChart year={sy.year} />
          <hr />
          <CompanyChart year={sy.year} />
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ChartComponent;
