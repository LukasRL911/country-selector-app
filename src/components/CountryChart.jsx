import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function CountryChart() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [populationData, setPopulationData] = useState([]);

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

  useEffect(() => {
    async function fetchPopulation() {
      if (!selectedCountry) return;

      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/population", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry })
        });

        const result = await res.json();
        const history = result.data?.populationCounts || [];
        setPopulationData(history);
      } catch (err) {
        console.error("Failed to fetch population data:", err);
      }
    }

    fetchPopulation();
  }, [selectedCountry]);

  const chartData = {
    labels: populationData.map((entry) => entry.year),
    datasets: [
      {
        label: `Population of ${selectedCountry}`,
        data: populationData.map((entry) => entry.value),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Population Trend for ${selectedCountry}` }
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <label htmlFor="chart-country-select">Dropdown 2 (for chart):</label>
      <br />
      <select
        id="chart-country-select"
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        style={{ padding: "0.5rem", minWidth: "250px", marginTop: "0.5rem" }}
      >
        <option value="">-- Select a country --</option>
        {countries.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      {selectedCountry ? (
        <Line data={chartData} options={options} />
      ) : (
        <p style={{ marginTop: "1rem" }}>Select a country to view its population chart.</p>
      )}
    </div>
  );
}
