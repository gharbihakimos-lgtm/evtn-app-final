import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setPosition({ lat: 36.8065, lng: 10.1815 });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setPosition({ lat: 36.8065, lng: 10.1815 });
        setLoading(false);
      }
    );
  }, []);

  return { position, error, loading };
}
