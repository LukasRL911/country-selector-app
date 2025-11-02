import { useState } from "react";
import CountriesDropdown from "./components/CountriesDropdown";
import CountryChart from "./components/CountryChart";

function App() {
  const [selectedCountry, setSelectedCountry] = useState("");

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", background: "#111", color: "#fff", minHeight: "100vh" }}>
      <h1>🌍 Country Dashboard</h1>
      <p>Select a country below to view inflation trends.</p>
      <CountriesDropdown selectedCountry={selectedCountry} onChange={setSelectedCountry} />
      <CountryChart selectedCountry={selectedCountry} />
    </div>
  );
}

export default App;
