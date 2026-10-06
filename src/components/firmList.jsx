import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Filter from "./filter"; 
import FirmDetailModal from "./practiceList"; 
import { Link, useSearchParams } from "react-router-dom";

export default function FirmList() {
  const [data, setData] = useState([]);
  const [prevData, setPrevData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRowName, setSelectedRowName] = useState(null);
  const [restFilter, setRestFilter] = useState({ show_inactive: false });
  const [wrap, setWrap] = useState(false);
  const [copied, setCopied] = useState(false);

  const [searchParams] = useSearchParams();
  const idFromURL = searchParams.get("id");
  const firmNameFromURL = searchParams.get("firmName");

  const [sortConfig, setSortConfig] = useState({ key: "firm_name", direction: "asc" });
  const [openPracticeCount, setOpenPracticeCount] = useState(false);
  const [selectionText, setSelectionText] = useState("");

  const searchInputRef = useRef(null);
  const rowRefs = useRef({});

  // Načtení dat při změně filtru z komponenty Filter
  useEffect(() => {
    fetchData(restFilter);
  }, [restFilter]);

  // Načtení stavu zalamování z localStorage
  useEffect(() => {
    const savedWrap = localStorage.getItem("wrapState");
    if (savedWrap !== null) {
      setWrap(JSON.parse(savedWrap));
    }
  }, []);

  const fetchData = async (filters = {}) => {
    try {
      // Předáme restFilter jako query parametry (např. ?show_inactive=true)
      const response = await axios.get("/api/v1/firms", {
        params: filters && typeof filters === "object" ? filters : {},
        withCredentials: true,
      });

      console.log("Odpověď z API:", response.data);

      let rawData = [];
      if (Array.isArray(response.data)) {
        rawData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        rawData = response.data.data;
      } else if (Array.isArray(response.data?.firms)) {
        rawData = response.data.firms;
      } else if (typeof response.data === "object" && response.data !== null) {
        const foundArray = Object.values(response.data).find((val) => Array.isArray(val));
        if (foundArray) rawData = foundArray;
      }

      const mappedData = rawData.map((item) => ({
        id: item.id || item.firm_id,
        firm_name: item.firm_name || item.name || item.nazev || "",
        street: item.street || item.ulice || "",
        city: item.city || item.mesto || "",
        zip: item.zip || item.psc || "",
        states_id: item.states_id || "",
        practice_count: item.practice_count ?? item.practices_count ?? 0,
        note: item.note || item.poznamka || "",
        state: item.state ?? item.active ?? "",
      }));

      setData(mappedData);
      setPrevData(mappedData);
    } catch (error) {
      console.error("Chyba při načítání dat:", error);
    }
  };

  const removeAccents = (str) =>
    str ? String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  // Filtrování na straně klienta
  const filteredData = data.filter((row) => {
    // 1. Textové vyhledávání v tabulce
    const textMatches = filterText
      ? Object.values(row).some((val) =>
          removeAccents(val).toLowerCase().includes(removeAccents(filterText).toLowerCase())
        )
      : true;

    // 2. Filtrování neaktivních firem podle volby ve Filter.jsx
    const showInactive = restFilter && typeof restFilter === "object" ? restFilter.show_inactive : false;
    const stateMatches = showInactive
      ? true
      : String(row.state) !== "0" && row.state !== false;

    return textMatches && stateMatches;
  });

  useEffect(() => {
    if (data.length > 0) {
      if (idFromURL) {
        const foundRow = data.find((row) => String(row.id) === String(idFromURL));
        if (foundRow) {
          setSelectedRowId(foundRow.id);
          setSelectedRowName(foundRow.firm_name);
          setOpenPracticeCount(true);
        }
      } else if (firmNameFromURL) {
        const foundRow = data.find(
          (row) => removeAccents(row.firm_name).toLowerCase() === removeAccents(firmNameFromURL).toLowerCase()
        );
        if (foundRow) {
          setSelectedRowId(foundRow.id);
          setSelectedRowName(foundRow.firm_name);
          setOpenPracticeCount(true);
        }
      }
    }
  }, [idFromURL, firmNameFromURL, data]);

  const toggleWrap = () => {
    const newWrap = !wrap;
    setWrap(newWrap);
    localStorage.setItem("wrapState", JSON.stringify(newWrap));
  };

  const handlePracticeListClick = (id, name) => {
    setSelectedRowId(id);
    setSelectedRowName(name);
    setOpenPracticeCount(true);
  };

  const handleModalClose = () => {
    setOpenPracticeCount(false);
    setSelectedRowId(null);
    setSelectedRowName(null);
  };

  const toggleSelectWithShift = (id, isShiftPressed) => {
    let newSelected = new Set(selectedIds);

    if (isShiftPressed && lastSelectedId !== null) {
      const currentIndex = filteredData.findIndex((row) => row.id === id);
      const lastIndex = filteredData.findIndex((row) => row.id === lastSelectedId);

      const [start, end] = [Math.min(currentIndex, lastIndex), Math.max(currentIndex, lastIndex)];
      const rangeIds = filteredData.slice(start, end + 1).map((row) => row.id);

      rangeIds.forEach((rangeId) => newSelected.add(rangeId));
    } else {
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setLastSelectedId(id);
    }

    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map((row) => row.id)));
    }
  };

  const handlePasteToPage = async () => {
    const selectedFirms = filteredData.filter((row) => selectedIds.has(row.id));
    const text = selectedFirms.map((firm) => firm.firm_name).join("; ");
    setSelectionText(text);

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("Kopírování do schránky selhalo:", err);
      }
    }
  };

  const sortByKey = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...data].sort((a, b) => {
      const valA = a[key] ?? "";
      const valB = b[key] ?? "";

      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }

      return direction === "asc"
        ? String(valA).localeCompare(String(valB), "cs", { sensitivity: "base" })
        : String(valB).localeCompare(String(valA), "cs", { sensitivity: "base" });
    });

    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const scrollToFirstLetter = (letter) => {
    const target = filteredData.find((row) =>
      removeAccents(row.firm_name.trim()).toLowerCase().startsWith(letter.toLowerCase())
    );
    if (target && rowRefs.current[target.id]) {
      rowRefs.current[target.id].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);
      if (!isInput && e.altKey && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
        scrollToFirstLetter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredData]);

  return (
    <>
      <div className="flex align-items border-bottom pb-2 gap-3">
        {/* Vyhledávací pole */}
        <div className="flex-grow-1">
          <input
            ref={searchInputRef}
            type="text"
            className="form-control"
            placeholder="Hledat firmu..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* Pokročilý filtr (komponenta Filter) */}
        {restFilter !== false && (
          <Filter
            setRestFilter={setRestFilter}
            initFormData={restFilter}
          />
        )}

        <div className="btn-group gap-2 ms-auto">
          <Link to="/firma/novy" className="btn btn-outline-success border shadow">
            Nová firma
          </Link>
          <button
            onClick={toggleWrap}
            className={`btn border shadow ${wrap ? "btn-secondary" : "btn-outline-secondary"}`}
          >
            {wrap ? "Ořezat text" : "Zalomit text"}
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className={`table ${wrap ? "" : "table-wrap"}`}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                />
              </th>
              <th>#</th>
              <th className="pointer" onClick={() => sortByKey("firm_name")}>
                Název firmy {sortConfig.key === "firm_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="pointer" onClick={() => sortByKey("street")}>
                Ulice {sortConfig.key === "street" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="pointer" onClick={() => sortByKey("city")}>
                Město {sortConfig.key === "city" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="pointer" onClick={() => sortByKey("zip")}>
                PSČ {sortConfig.key === "zip" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="pointer" onClick={() => sortByKey("state")}>
                Stát {sortConfig.key === "state" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="pointer text-center" onClick={() => sortByKey("practice_count")}>
                Praxe {sortConfig.key === "practice_count" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Poznámka</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr
                key={row.id}
                ref={(el) => (rowRefs.current[row.id] = el)}
                className={selectedIds.has(row.id) ? "table-active" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={(e) => toggleSelectWithShift(row.id, e.nativeEvent.shiftKey)}
                  />
                </td>
                <td>{index + 1}</td>
                <td>
                  <Link to={`/firma/detail/${row.id}`} title="Zobrazit detail firmy">
                    {row.firm_name}
                  </Link>
                </td>
                <td>{row.street}</td>
                <td>{row.city}</td>
                <td>{row.zip}</td>
                <td>{row.state}</td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handlePracticeListClick(row.id, row.firm_name)}
                  >
                    {row.practice_count}
                  </button>
                </td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <button
          className="btn btn-primary me-2"
          onClick={handlePasteToPage}
          disabled={selectedIds.size === 0}
        >
          Vložit označené na stránku & kopírovat ({selectedIds.size})
        </button>
        {copied && <span className="text-success ms-2">Zkopírováno do schránky!</span>}

        {selectionText && (
          <div className="mt-2">
            <textarea
              className="form-control"
              rows={3}
              value={selectionText}
              readOnly
            />
          </div>
        )}
      </div>

      {openPracticeCount && (
        <FirmDetailModal
          isOpen={openPracticeCount}
          onClose={handleModalClose}
          id={selectedRowId}
          name={selectedRowName}
        />
      )}
    </>
  );
}