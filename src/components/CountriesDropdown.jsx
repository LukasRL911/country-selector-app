import { useEffect, useState } from "react";

export default function CountriesDropdown({ selectedCountry, onChange }) {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
        const result = await res.json();
        const names = result.data.map((c) => c.name).sort();
        setCountries(names);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    }
    fetchCountries();
  }, []);

  return (
    <div style={{ marginBottom: "2rem" }}>
      <label htmlFor="dropdown1" style={{ fontWeight: "bold" }}>
        Dropdown 1 (for country list):
      </label>
      <br />
      <select
        id="dropdown1"
        value={selectedCountry}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: "0.5rem", minWidth: "250px", marginTop: "0.5rem" }}
      >
        <option value="">-- Select a country --</option>
        {countries.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {selectedCountry && (
        <p style={{ marginTop: "0.5rem" }}>You selected: {selectedCountry}</p>
      )}
    </div>
  );
}
