import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Filter from './filter';
import EditFirmForm from './firmform';
import FutureEvents from './futureEvents';
import GiftList from './giftList';
import Notification from './notification';
import PracticeList from './practiceList';
import { useUrl } from './UrlProvider';

import { getCookie, setCookie } from '../utils/cookie';
import useIsSmall from '../utils/mobileDetect';

const getFirstPart = (text) => {
  const parts = text?.split(/\/\(kont\)/) ?? [];
  return parts[0];
};

const FirmList = () => {
  const isSmall = useIsSmall();
  const navigate = useNavigate();
  const { idFromURL, firmName } = useParams();
  const { url, apiUrl, user } = useUrl();

  const [data, setData] = useState([]);
  const [prevData, setPrevData] = useState([]);
  const [restData, setRestData] = useState([]);
  const [restFilter, setRestFilter] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');

  // Modály a vybrané položky (Kontakty, Schůzky a Akce už se otevírají přes trasu)
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [selectedFirmName, setSelectedFirmName] = useState(null);
  const [selectedGift, setSelectedGift] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);

  // Výběr řádků
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionText, setSelectionText] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  const [isWrapped, setIsWrapped] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filtr funkcionalita
  const makeHandleFilter = useCallback(
    (value) => {
      if (!value || value.length < 2) {
        setData(prevData);
        return;
      }
      const normalizedValue = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      const newFilteredData = prevData.filter((item) => {
        const itemName = item.name
          ? item.name
              .toString()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
          : '';
        return itemName.includes(normalizedValue);
      });
      setData(newFilteredData);
    },
    [prevData]
  );

  const handleFilter = (event) => {
    const { value } = event.target;
    setFilterText(value);
    makeHandleFilter(value);
  };

  const handlePaste = () => {
    setData(prevData);
  };

  const handleClearInput = () => {
    setFilterText('');
    setData(prevData);
  };

  // Načítání dat
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = restFilter ? `/filter/?${restFilter}` : '';
      const response = await axios.get(`${apiUrl}firms/list${queryString}`);
      setData(response.data);
      setPrevData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, restFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (filterText.length > 0) {
      makeHandleFilter(filterText);
    }
  }, [filterText, makeHandleFilter]);

  // cookie isWrapped
  useEffect(() => {
    const saved = getCookie('isWrapped');
    if (saved !== null) {
      setIsWrapped(saved === '1');
    }
  }, []);

  const toggleWrap = () => {
    const newValue = !isWrapped;
    setIsWrapped(newValue);
    setCookie('isWrapped', newValue ? '1' : '0', 1);
  };

  // Alt + Klávesa skok na řádek
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && /^[a-zA-Z]$/.test(e.key)) {
        const targetRow = document.getElementById(`row-${e.key.toLowerCase()}`);
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Odchytávání parametrů z URL
  useEffect(() => {
    if (idFromURL && prevData.length > 0) {
      const firmIdNum = Number(idFromURL);
      if (!Number.isNaN(firmIdNum)) {
        setSelectedFirm(firmIdNum);
      }
    }
  }, [idFromURL, prevData]);

  const parseFirmNameFromUrl = (segment) => {
    if (!segment) return '';
    return decodeURIComponent(segment).replace(/-/g, ' ');
  };

  useEffect(() => {
    if (!firmName || prevData.length === 0) return;
    const q = parseFirmNameFromUrl(firmName);
    setFilterText(q);
    makeHandleFilter(q);
  }, [firmName, prevData, makeHandleFilter]);

  // Výběr řádků s podporou SHIFT
  const toggleSelectWithShift = (index, id, shiftKey) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const willSelect = !next.has(id);

      if (shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const idsInRange = data.slice(start, end + 1).map((row) => row.id);

        idsInRange.forEach((rid) => {
          if (willSelect) {
            next.add(rid);
          } else {
            next.delete(rid);
          }
        });
      } else if (willSelect) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

    setLastSelectedIndex(index);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setSelectionText('');
    setLastSelectedIndex(null);
  };

  const handlePasteToPage = async () => {
    const namesById = new Map(prevData.map((item) => [item.id, item.name]));
    const names = Array.from(selectedIds)
      .map((sid) => getFirstPart(namesById.get(sid) ?? ''))
      .filter(Boolean);

    const text = names.join('; ');
    setSelectionText(text);

    if (navigator.clipboard && text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        console.error('Kopírování do schránky selhalo:', e);
      }
    }
  };

  // Akce modálů / Přesměrování
  const handleEditClick = (firmId, name = null) => {
    setSelectedFirmName(name);
    setSelectedFirm(Number(firmId));
  };

  const handleGiftListClick = (id, name) => {
    setSelectedFirmName(name);
    setSelectedGift(id);
  };

  const handlePracticeListClick = (id) => {
    navigate(`/practiceListTable/${id}`);
  };

  const handleEditEventClick = (id) => {
    navigate(`/events/${id}`);
  };

  const handleRestFilter = (newRestData) => {
    const params = new URLSearchParams(newRestData);
    setRestFilter(params.toString());
    setRestData({ show_inactive: newRestData.show_inactive });
  };

  const deleteFirm = async (firmId) => {
    try {
      const response = await axios.delete(`${apiUrl}firms/${firmId}`);
      if (response.status === 200) {
        setData((prevFirm) => prevFirm.filter((firm) => firm.id !== firmId));
      } else {
        setError('Smazání firmy selhalo');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelClick = (firmId) => {
    if (window.confirm('Chceš to fakt vymazat?')) {
      deleteFirm(firmId);
    }
  };

  const handleSaveAfterAddFirm = (firmNameInput) => {
    setFilterText(firmNameInput);
    fetchData();
    setSelectedFirm(null);
    makeHandleFilter(firmNameInput);
  };

  // Řazení
  const sortByKey = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  if (loading) return <p className="no-data">Načítání...</p>;
  if (error) {
    return (
      <p className="no-data">
        Chyba: {error} <a href={`${url}`}>Přihlásit</a>
      </p>
    );
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const csvURL = `${apiUrl}firms/list/?csvexport`;

  return (
    <>
      <FutureEvents />

      {restFilter ? (
        <div>
          <Filter setRestFilter={handleRestFilter} initFormData={restData} />
        </div>
      ) : (
        <div className="filter-bar">
          <input
            type="text"
            name="name"
            className="search"
            placeholder="filtrovat dle názvu či kontaktu"
            tabIndex={0}
            value={filterText}
            onChange={handleFilter}
            onPaste={handlePaste}
          />
          <button
            type="button"
            onClick={() => setRestFilter(true)}
            className="filter-ex"
            title="Rozšířený filtr"
          />
          <button
            type="button"
            className="clear-input-filter-btn fn-btn"
            onClick={handleClearInput}
            style={{ cursor: 'pointer' }}
          >
            X
          </button>
        </div>
      )}

      {selectedGift && (
        <GiftList
          firmId={selectedGift}
          onSave={() => setSelectedGift(null)}
          firmName={selectedFirmName}
          onClose={() => setSelectedGift(null)}
        />
      )}

      {selectedPractice && (
        <PracticeList
          firmId={selectedPractice}
          onSave={() => setSelectedPractice(null)}
          firmName={selectedFirmName}
          onClose={() => setSelectedPractice(null)}
        />
      )}

      {selectedFirm ? (
        <EditFirmForm
          firmId={selectedFirm}
          onSave={() => {
            setSelectedFirm(null);
            fetchData();
          }}
          handleSaveAfterAddFirm={handleSaveAfterAddFirm}
          onClose={() => setSelectedFirm(null)}
          firmName={selectedFirmName}
        />
      ) : (
        <>
          {/* Panel pro práci s výběrem */}
          <div
            className="selection-panel"
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              margin: '8px 0',
            }}
          >
            <button
              type="button"
              className="fn-btn"
              onClick={handlePasteToPage}
              disabled={selectedIds.size === 0}
              title="Vloží jména vybraných firem na stránku a zkopíruje do schránky"
            >
              Vložit výběr na stránku
            </button>
            <button
              type="button"
              className="fn-btn"
              onClick={handleClearSelection}
              disabled={selectedIds.size === 0 && selectionText.length === 0}
              title="Zruší výběr a vymaže výstup"
            >
              Vymazat výběr
            </button>
            <span style={{ opacity: 0.7 }}>
              {selectedIds.size > 0 ? `Vybráno: ${selectedIds.size}` : 'Nevybráno nic'}
            </span>
          </div>

          {/* Výstup vybraných jmen na stránku */}
          {selectionText && (
            <div className="selection-output" style={{ margin: '8px 0' }}>
              <label
                id="selected-firms-label"
                htmlFor="selected-firms"
                style={{ display: 'block', marginBottom: 4 }}
              >
                Vybrané firmy (oddělené středníkem):
              </label>
              <textarea
                id="selected-firms"
                aria-labelledby="selected-firms-label"
                readOnly
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
                value={selectionText}
              />
            </div>
          )}

          <table className={`firmlist responsive-table ${isWrapped ? 'wrap-cells' : 'nowrap-cells'}`}>
            {data.length > 0 && <caption>Počet záznamů: {data.length}</caption>}
            <thead>
              <tr>
                <th>
                  <span
                    onClick={toggleWrap}
                    style={{
                      cursor: 'pointer',
                      fontSize: '1.2em',
                      paddingLeft: '1em',
                    }}
                    title="Přepnout zalamování textu"
                  >
                    🔁
                  </span>
                  &nbsp;Vybrat
                </th>

                {columns.map((column) => (
                  <th
                    key={column}
                    onClick={() => sortByKey(column)}
                    className={`col-${column} ${getSortIcon(column) ? 'sorted-colm' : ''}`}
                  >
                    {column === 'name' ? (
                      <>
                        Firma ({data.length}) {getSortIcon(column)}
                      </>
                    ) : (
                      `${column} ${getSortIcon(column)}`
                    )}
                  </th>
                ))}
                <th style={{ textAlign: 'left' }}>
                  <button
                    type="button"
                    className="add-firm-bnt"
                    onClick={() => handleEditClick(-1)}
                  >
                    +
                  </button>
                  <a href={csvURL} id="csv_export">
                    CSV export
                  </a>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={row.id} id={`row-${row.name?.charAt(0).toLowerCase()}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={(e) => {
                        toggleSelectWithShift(
                          rowIndex,
                          row.id,
                          e.nativeEvent?.shiftKey || e.shiftKey
                        );
                      }}
                    />
                  </td>

                  {columns.map((column) =>
                    column === 'name' ? (
                      <td
                        key={column}
                        onClick={() => handleEditClick(row.id, row.name)}
                      >
                        {(() => {
                          const parts = row[column]?.split(/\/\(kont\)/) ?? [];
                          return (
                            <>
                              <span className={isWrapped ? 'wrap' : ''}>{parts[0]}</span>
                              {parts[1] && <span className="col-contacts">{parts[1]}</span>}
                            </>
                          );
                        })()}
                      </td>
                    ) : (
                      <td
                        key={column}
                        className={`col-${column} ${getSortIcon(column) ? 'sorted-colm' : ''}`}
                      >
                        {row[column]}
                      </td>
                    )
                  )}

                  <td>
                    <div className={isSmall ? 'small-resolution' : ''}>
                      <button 
                        type="button" 
                        onClick={() => navigate(`/firms/${row.id}/contacts`)}
                      >
                        Kontakty
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/firms/${row.id}/meets`)}
                        className="blue-btn"
                      >
                        Schůzky
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/firms/${row.id}/workshops`)}
                      >
                        Akce
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditEventClick(row.id)}
                        className="green-btn"
                      >
                        Událost
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGiftListClick(row.id, row.name)}
                        className="orange-btn"
                      >
                        Dary
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePracticeListClick(row.id)}
                        className="purple-btn"
                      >
                        Praxe
                      </button>
                      {user?.user !== 'reader' && (
                        <button
                          type="button"
                          onClick={() => handleDelClick(row.id)}
                          className="del-btn"
                        >
                          Smazat
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Fixní spodní lišta pro výběr */}
          <div
            className="selection-panel"
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              padding: '10px',
              position: 'fixed',
              bottom: 0,
              background: 'white',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <button
              type="button"
              className="blue-btn"
              onClick={handlePasteToPage}
              disabled={selectedIds.size === 0}
              title="Zkopírovat do schránky a vložit na stránku"
            >
              Vložit výběr na stránku & kopírovat
            </button>
            <button
              type="button"
              className="red-btn"
              onClick={handleClearSelection}
              disabled={selectedIds.size === 0 && selectionText.length === 0}
              title="Zruší výběr a vymaže výstup"
            >
              Vymazat výběr
            </button>
            <span>
              {selectedIds.size > 0 ? `Vybráno: ${selectedIds.size}` : 'Nevybráno nic'}
            </span>
            {copied && <Notification message="Zkopírováno do schránky ✓" type="edit-firm-success" />}
          </div>
        </>
      )}
    </>
  );
};

export default FirmList;