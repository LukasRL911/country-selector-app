import { useEffect, useState } from "react";

export default function CountriesDropdown() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const result = await res.json();
        console.log("Fetched countries:", result);

        if (result.error || !result.data) throw new Error("Invalid response");

        const countryNames = result.data
          .map((country) => country.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        setCountries(countryNames);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    }

    fetchCountries();
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <label htmlFor="country-select">Select Country</label>
      <br />
      <select
        id="country-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{ padding: "0.5rem", minWidth: "250px", marginTop: "0.5rem" }}
      >
        <option value="">-- Select a country --</option>
        {countries.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      {selected && <p>You selected: {selected}</p>}
    </div>
  );
}
