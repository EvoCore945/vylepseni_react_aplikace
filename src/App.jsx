import React, { useEffect } from 'react';
import {
  BrowserRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import AllWSlist from './components/allWSlist';
import Auth401Guard from './components/Auth401Guard';
import CampaignContactsList from './components/campaignContactsList';
import CampaignList from './components/campaignList';
import ChartComponent from './components/chartComponent';
import ColumnList from './components/columnList';
import CampaignForm from './components/editCampaignForm';
import EditEventForm from './components/editEventForm';
import EventList from './components/eventsList';
import ExportForm from './components/exportForm';
import FirmList from './components/firmList';
// import GAuthProvider from './components/google/googleAuthProvider';
import HideColm from './components/hideColm';
import Nav from './components/nav';
import PracticeListTable from './components/practiceListTable';
import Stats from './components/stats';
import StatsByYears from './components/statsByYears';
import StatsInvitations from './components/statsInvitations';
import UrlProvider from './components/UrlProvider';

const AppContentInner = () => {
  const location = useLocation();

  useEffect(() => {
    // pro localhost generuji speciální cookie, abych mohl rozlišit uživatele.
    // Vytváří se po přihlášení
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (user && window.location.hostname === 'localhost') {
      document.cookie = `localhostUser=${user}; path=/;`;
    }

    const appElement = document.querySelector('#app');

    // Odeber předchozí třídy (volitelné, pokud chceš mít vždy jen jednu)
    appElement.className = '';

    // Vytvoř kebab-case třídu z cesty
    const kebabClass = location.pathname
      .replace(/^\/|\/$/g, '') // odstraní počáteční a koncové lomítko
      .replace(/([a-z])([A-Z])/g, '$1-$2') // přidá pomlčku mezi camelCase
      .replace(/\//g, '-') // nahradí lomítka pomlčkami
      .toLowerCase() || 'home';

    appElement.classList.add(kebabClass);
  }, [location]);

  return (
    <>
      <Nav />
      <Routes>
        <Route end path="/" element={<FirmList />} />
        <Route path="/firm" element={<FirmList />} />
        <Route path="/firm/:firmName" element={<FirmList />} />
        <Route path="/:idFromURL" element={<FirmList />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventList />} />
        <Route path="/events/:id/:eventId" element={<EditEventForm />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/allWSlist" element={<AllWSlist />} />
        <Route path="/graph" element={<ChartComponent />} />
        <Route path="/statsByYears" element={<StatsByYears />} />
        <Route path="/statsInvitations" element={<StatsInvitations />} />
        <Route path="/hidecolm" element={<HideColm />} />
        <Route path="/campaign" element={<CampaignList />} />
        <Route path="/campaignAdd/:id" element={<CampaignForm />} />
        <Route path="/getCampaignContacts/:id" element={<CampaignContactsList />} />
        <Route path="/practiceListTable/:firmId" element={<PracticeListTable />} />
        <Route path="/practiceListTable" element={<PracticeListTable />} />
        <Route path="/campaignAdd" element={<CampaignForm />} />
        <Route path="/columnList" element={<ColumnList />} />
        <Route path="/exportForm" element={<ExportForm />} />
      </Routes>
    </>
  );
};

const AppContent = () => (
  <BrowserRouter>
    <Auth401Guard>
      <AppContentInner />
    </Auth401Guard>
  </BrowserRouter>

);

const App = () => (
  <UrlProvider>
    <AppContent />
  </UrlProvider>
);

export default App;
