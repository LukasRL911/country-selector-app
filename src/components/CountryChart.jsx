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

        // Helper to fetch a World Bank indicator with a long date range
        const fetchSeries = async (indicator) => {
          const resp = await fetch(
            `https://api.worldbank.org/v2/country/${code}/indicator/${indicator}?format=json&per_page=1000&date=1960:2024`
          );
          const json = await resp.json();
          return json[1] || [];
        };

        // Try to fetch the direct year-over-year inflation indicator first
        const ygData = await fetchSeries("FP.CPI.TOTL.ZG");
        const ygEntries = (ygData || [])
          .filter((item) => item.value !== null)
          .map((item) => ({ year: item.date, inflation_rate: Number(item.value.toFixed(2)) }))
          .sort((a, b) => Number(a.year) - Number(b.year));

        // Decide whether to fallback to CPI index based on coverage
        const needsFallback =
          ygEntries.length === 0 ||
          (ygEntries.length < 20 && Math.min(...ygEntries.map((e) => Number(e.year))) > 2000);

        if (!needsFallback) {
          setInflationData(ygEntries);
        } else {
          // Fetch CPI index and compute YoY inflation where possible
          const cpiData = await fetchSeries("FP.CPI.TOTL");
          const cpiMap = {};
          (cpiData || [])
            .filter((item) => item.value !== null)
            .forEach((item) => {
              cpiMap[Number(item.date)] = Number(item.value);
            });

          const years = Object.keys(cpiMap)
            .map((y) => Number(y))
            .sort((a, b) => a - b);

          const computed = [];
          for (let i = 1; i < years.length; i++) {
            const y = years[i];
            const prev = years[i - 1];
            // Only compute if consecutive years are present
            if (y - prev === 1 && cpiMap[prev] && cpiMap[y]) {
              const inflation = (cpiMap[y] / cpiMap[prev] - 1) * 100;
              computed.push({ year: String(y), inflation_rate: Number(inflation.toFixed(2)) });
            }
          }

          if (computed.length > 0) {
            setInflationData(computed);
          } else {
            // fallback: use whatever ygEntries we have (even if small) or empty
            setInflationData(ygEntries);
          }
        }
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
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 13 } } },
      title: { display: true, text: `Inflation Trend for ${selectedCountry}`, font: { size: 18 } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { font: { size: 12 } }, title: { display: true, text: "Year", font: { size: 14 } } },
      y: { ticks: { font: { size: 12 } }, title: { display: true, text: "Inflation (%)", font: { size: 14 } } },
    },
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", height: "480px", transform: "translateX(30px)" }}>
      {selectedCountry ? (
        inflationData.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p style={{ marginTop: "1rem", color: "#dc0f0fff" }}>
            No inflation data found for {selectedCountry}.
          </p>
        )
      ) : (
        <p style={{ marginTop: "1rem" }}>Select a country to view its inflation chart.</p>
      )}
    </div>
  );
}
