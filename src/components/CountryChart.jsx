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

export default function CountryChart({ selectedCountry }) {
  const [inflationData, setInflationData] = useState([]);

  useEffect(() => {
    async function fetchInflation() {
      if (!selectedCountry) {
        setInflationData([]);
        return;
      }

      try {
        // Try to resolve ISO2 code using restcountries API
        let code = null;

        try {
          let res = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(selectedCountry)}?fullText=true`
          );
          if (!res.ok) {
            // fallback to non-fullText search
            res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(selectedCountry)}`);
          }

          if (res.ok) {
            const data = await res.json();
            code = data?.[0]?.cca2 || null;
          }
        } catch (err) {
          console.warn("restcountries lookup failed, falling back to mapping", err);
        }

        // Basic fallback mapping for some common countries
        const fallbackMap = {
          "United States": "US",
          USA: "US",
          Canada: "CA",
          Germany: "DE",
          Brazil: "BR",
          Argentina: "AR",
          Japan: "JP",
          France: "FR",
          China: "CN",
          India: "IN",
          Mexico: "MX",
          Italy: "IT",
          Spain: "ES",
          Australia: "AU",
          "South Africa": "ZA",
        };

        if (!code) {
          code = fallbackMap[selectedCountry] || null;
        }

        if (!code) {
          console.warn("No ISO code found for:", selectedCountry);
          setInflationData([]);
          return;
        }

        const res = await fetch(
          `https://api.worldbank.org/v2/country/${code}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1000`
        );
        const result = await res.json();

        const entries = (result[1] || [])
          .filter((item) => item.value !== null)
          .map((item) => ({
            year: item.date,
            inflation_rate: Number(item.value.toFixed(2)),
          }))
          .reverse();

        setInflationData(entries);
      } catch (err) {
        console.error("Failed to fetch inflation data:", err);
        setInflationData([]);
      }
    }

    fetchInflation();
  }, [selectedCountry]);

  const chartData = {
    labels: inflationData.map((entry) => entry.year),
    datasets: [
      {
        label: `Inflation Rate of ${selectedCountry}`,
        data: inflationData.map((entry) => entry.inflation_rate),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Inflation Trend for ${selectedCountry}` },
    },
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      {selectedCountry ? (
        inflationData.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p style={{ marginTop: "1rem", color: "#888" }}>
            No inflation data found for {selectedCountry}.
          </p>
        )
      ) : (
        <p style={{ marginTop: "1rem" }}>Select a country to view its inflation chart.</p>
      )}
    </div>
  );
}
