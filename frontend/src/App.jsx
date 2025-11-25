import React, { useState } from "react";
import { CountryDropdown } from "./components/CountryDropdown";
import { InflationGraph } from "./components/InflationGraph";
import { Loading } from "./components/Loading";
import { useCountries } from "./hooks/useCountries";
import { useInflation } from "./hooks/useInflation";

const App = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const { countries, loading: countriesLoading } = useCountries();
  const { data, loading: inflationLoading } = useInflation(selectedCountry);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Country Inflation Dashboard</h1>

      {countriesLoading ? (
        <Loading />
      ) : (
        <CountryDropdown
          countries={countries}
          selected={selectedCountry}
          onChange={setSelectedCountry}
        />
      )}

      {inflationLoading ? <Loading /> : <InflationGraph data={data} />}
    </div>
  );
};

export default App;
