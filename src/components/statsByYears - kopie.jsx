import React, { useEffect, useState } from 'react';
// import CopyFirmNamesButton from './CopyFirmNamesButton';
import FetchWrapper from './fetchWrapper';
import Notification from './notification';
import SelectSchoolYear from './selectSchoolYear';
import { useUrl } from './UrlProvider';
import convertDateToCzech from '../utils/czechdates';

const StatsByYears = () => {
  const { apiUrl } = useUrl();
  const y = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(y);
  const [msg, setMsg] = useState(null);
  const renderTable = (data) => (
    <table>
      <caption><h2>Praxe</h2></caption>
      <thead>
        <tr>
          <th>Firma</th>
          <th>Ročník</th>
          <th>Počet</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.firm_id}>
            <td>{item.firm_name}</td>
            <td>{item.annual}</td>
            <td>{item.count}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="100%">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  data.map((item) => item.firm_name).filter(Boolean).join('; '),
                );
                setMsg('Názvy firem byly zkopírovány.');
              }}
            >
              Kopírovat názvy firem
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
  const renderTable2 = (data) => (
    <table>
      <caption><h2>Pozvánky</h2></caption>
      <thead>
        <tr>
          <th>Firma</th>
          <th>A adres</th>
          <th>E adres</th>
          <th>I adres</th>
          <th>A neadres</th>
          <th>E neadres</th>
          <th>I neadres</th>
          <th>Všem</th>
          <th>Celkem</th>
          <th>Poznámka</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.firm_id}>
            <td>{item.firm_name}</td>
            <td>{item.A_adres}</td>
            <td>{item.E_adres}</td>
            <td>{item.I_adres}</td>
            <td>{item.A_neadres}</td>
            <td>{item.E_neadres}</td>
            <td>{item.I_neadres}</td>
            <td>{item.vsem}</td>
            <td>{item.count}</td>
            <td>{item.note}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <td>
          <button
            type="button"
            onClick={() => {
              const firmNames = data
                .map((item) => item.firm_name)
                .filter(Boolean)
                .join('; ');

              navigator.clipboard.writeText(firmNames);
              setMsg('Názvy firem byly zkopírovány.');
            }}
          >
            Kopírovat názvy firem
          </button>
        </td>
      </tfoot>
    </table>
  );
  const renderTable3 = (data) => (
    <table>
      <caption><h2>Přednášky, Worskshop, Exkurze atd.</h2></caption>
      <thead>
        <tr>
          <th>Firma</th>
          <th>Typ</th>
          <th>Datum</th>

        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.firm_id}>
            <td>{item.firm_name}</td>
            <td>{item.typ}</td>
            <td className="no-wrap">{convertDateToCzech(item.datum)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <td>
          <button
            type="button"
            onClick={() => {
              const firmNames = data
                .map((item) => item.firm_name)
                .filter(Boolean)
                .join('; ');

              navigator.clipboard.writeText(firmNames);
              setMsg('Názvy firem byly zkopírovány.');
            }}
          >
            Kopírovat názvy firem
          </button>
        </td>
      </tfoot>
    </table>
  );
  const renderTable4 = (data) => (
    <table>
      <caption><h2>Dary</h2></caption>
      <thead>
        <tr>
          <th>Firma</th>
          <th>Počet</th>

        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.firm_id}>
            <td>{item.firm_name}</td>
            <td>{item.count}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <td>
          <button
            type="button"
            onClick={() => {
              const firmNames = data
                .map((item) => item.firm_name)
                .filter(Boolean)
                .join('; ');

              navigator.clipboard.writeText(firmNames);
              setMsg('Názvy firem byly zkopírovány.');
            }}
          >
            Kopírovat názvy firem
          </button>
        </td>
      </tfoot>

    </table>
  );
  const renderTable5 = (data) => (
    <table>
      <caption><h2>Schůzky</h2></caption>
      <thead>
        <tr>
          <th>Firma</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.firm_id}>
            <td>{item.firm_name}</td>
            <td className="no-wrap">{convertDateToCzech(item.datum)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <td>
          <button
            type="button"
            onClick={() => {
              const firmNames = data
                .map((item) => item.firm_name)
                .filter(Boolean)
                .join('; ');

              navigator.clipboard.writeText(firmNames);
              setMsg('Názvy firem byly zkopírovány.');
            }}
          >
            Kopírovat názvy firem
          </button>
        </td>
      </tfoot>
    </table>
  );
  const renderTable6 = (data) => (
    <table>
      <caption><h2>Neaktivní firmy</h2></caption>
      <thead>
        <tr>
          <th>Firma</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <td>
          <button
            type="button"
            onClick={() => {
              const firmNames = data
                .map((item) => item.firm_name)
                .filter(Boolean)
                .join('; ');

              navigator.clipboard.writeText(firmNames);
              setMsg('Názvy firem byly zkopírovány.');
            }}
          >
            Kopírovat názvy firem
          </button>
        </td>
      </tfoot>
    </table>
  );
  const renderComponet = () => (
    <div>
      {msg && (<Notification message={msg} type="edit-firm-success" />)}
      <h1>Statistika dle školních let</h1>
      <SelectSchoolYear selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      <div className="stats-by-years-tables">
        <FetchWrapper
          url={`${apiUrl}stats/getAllWSs/${selectedYear}`}
          render={renderTable3}
        />
        <FetchWrapper
          url={`${apiUrl}stats/getAllMeets/${selectedYear}`}
          render={renderTable5}
        />
        <FetchWrapper
          url={`${apiUrl}stats/getAllGifts/${selectedYear}`}
          render={renderTable4}
        />
        <FetchWrapper
          url={`${apiUrl}stats/practices/${selectedYear}`}
          render={renderTable}
        />
        <FetchWrapper
          url={`${apiUrl}stats/invitations/${selectedYear}`}
          render={renderTable2}
        />
        <FetchWrapper
          url={`${apiUrl}stats/getAllNotActivity/${selectedYear}`}
          render={renderTable6}
        />
      </div>
    </div>
  );

  useEffect(() => {
    renderComponet();
  }, [selectedYear, msg]);

  return (
    <div>
      {renderComponet()}
    </div>
  );
};

export default StatsByYears;
