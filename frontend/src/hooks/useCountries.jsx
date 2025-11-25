import { useState, useEffect } from "react";
import axios from "axios";

export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/countries")
      .then(res => setCountries(res.data.countries))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { countries, loading };
};
