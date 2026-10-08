import React, { useState } from 'react';

/**
 * Univerzální tabulka
 * @param {Array} data - Pole objektů k zobrazení
 * @param {Array} columns - Pole definic sloupců [{ key: 'id', label: 'ID', render: (row) => ... }]
 * @param {Function} renderActions - Nepovinná funkce pro vykreslení tlačítek akcí na konci řádku
 * @param {String} title - Název / Titulek tabulky
 */
const UniversalTable = ({ data = [], columns = [], renderActions = null, title = '' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Univerzální řazení
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const valA = a[sortConfig.key] ?? '';
      const valB = b[sortConfig.key] ?? '';

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="responsive-table">
      {title && <h2>{title}</h2>}
      <table className="firmlist responsive-table">
        <caption>Počet záznamů: {sortedData.length}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
              >
                {col.label} {getSortIcon(col.key)}
              </th>
            ))}
            {renderActions && <th>Akce</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {renderActions && <td>{renderActions(row)}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} style={{ textAlign: 'center' }}>
                Žádná data k zobrazení.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UniversalTable;