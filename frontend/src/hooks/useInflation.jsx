import { useState, useEffect } from "react";
import axios from "axios";

export const useInflation = (countryCode) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);
    axios.get(`http://127.0.0.1:8000/inflation/${countryCode}`)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [countryCode]);

  return { data, loading };
};
