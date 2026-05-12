import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUrl } from './UrlProvider';

const nav = () => {
  const { url } = useUrl();
  const [isOpen, setIsOpen] = useState(false);
  const { isDirty, setIsDirty } = useUrl();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleNavClick = (e, to) => {
    if (location.pathname === to) {
      closeMenu();
      return;
    }

    if (isDirty) {
      const ok = window.confirm(
        'Máte neuložené změny. Opravdu chcete stránku opustit?',
      );

      if (!ok) {
        e.preventDefault(); // 🚫 zablokuje NavLink
        return;
      }

      setIsDirty(false);
    }

    closeMenu();
  };

  return (
    <nav>
      <div
        className="menu-toggle"
        onClick={toggleMenu}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleMenu();
          }
        }}
        role="button"
        tabIndex="0"
        aria-label="Toggle menu"
      >
        <div className="hamburger" />
        <div className="hamburger" />
        <div className="hamburger" />
      </div>
      <ul className={`menu ${isOpen ? 'active' : ''}`}>
        <li>
          <NavLink end to="/" onClick={(e) => handleNavClick(e, '/')}>Seznam firem</NavLink>
          <ul>
            <li>
              <NavLink to="/events" onClick={(e) => handleNavClick(e, '/events')}>Údálosti</NavLink>
            </li>
            <li>
              <a href={`${url}firms/exportFirms.php`} target="_blank" rel="noreferrer">Export pro poštu</a>
            </li>
            <li>
              <a href={`${url}firms/exportFirmsmailing.php`} target="_blank" rel="noreferrer">Export - hlavní kontakty</a>
            </li>
            <li>
              <a href={`${url}firms/exportFirmsmailing.php?other=1`} target="_blank" rel="noreferrer">Export - ostaní kontakty</a>
              <NavLink to="/exportForm">Export</NavLink>
            </li>
            <li>
              <a href={`${url}rest.php/contacts/exportVcf`} target="_blank" rel="noreferrer">Export kontaktů</a>
            </li>
          </ul>
        </li>
        <li>
          <NavLink to="/stats" onClick={(e) => handleNavClick(e, '/stats')}>Statistiky</NavLink>
          <ul>
            <li>
              <NavLink to="/statsInvitations" onClick={(e) => handleNavClick(e, '/statsInvitations')}>Pozvánky dle školních let</NavLink>
            </li>
            {/*
            <li>
              <NavLink to="/allWSlist" onClick={closeMenu}>WS dle školních let</NavLink>
            </li>
            */}
            <li>
              <NavLink to="/graph" onClick={(e) => handleNavClick(e, '/graph')}>Grafy</NavLink>
            </li>
            <li>
              <NavLink to="/statsByYears" onClick={(e) => handleNavClick(e, '/statsByYears')}>Dle školních let</NavLink>
            </li>
            <li>
              <a href="/rest.php/stats/export" rel="noreferrer" onClick={closeMenu}>Export do csv</a>
            </li>
          </ul>
        </li>
        <li>
          <a href="/settings/#" rel="noreferrer" onClick={closeMenu}>Nastavení</a>
          <ul>
            <li>
              <NavLink to="/hidecolm" onClick={closeMenu}>Skrýt sloupce</NavLink>
            </li>
            <li>
              <NavLink to="/columnList" onClick={closeMenu}>Upravit sloupce</NavLink>
            </li>
          </ul>
        </li>
        <li>
          <NavLink to="/campaign" onClick={closeMenu}>Zasílání</NavLink>
          <ul>
            <li>
              <NavLink to="/campaignAdd" onClick={closeMenu}>Založit</NavLink>
            </li>
          </ul>
        </li>
        <li>
          <NavLink to="/practiceListTable" onClick={closeMenu}>Praxe</NavLink>
        </li>
        <li>
          <a href={`${url}?logout`} rel="noreferrer">Odhlásit</a>
        </li>
      </ul>
    </nav>
  );
};

export default nav;
