import React from "react";

export const CountryDropdown = ({ countries, selected, onChange }) => {
  return (
    <select value={selected} onChange={e => onChange(e.target.value)}>
      <option value="">Select a country</option>
      {countries.map(c => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  );
};
