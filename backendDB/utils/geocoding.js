// Reverse geocoding utility using OpenStreetMap Nominatim
// Converts latitude and longitude into a human-readable address (display_name).

async function getAddressFromCoordinates(lat, lon) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'civic-issues-app/1.0 (contact@example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.display_name) {
      throw new Error('No address found for these coordinates');
    }

    return data.display_name;
  } catch (err) {
    console.error('Reverse geocoding failed:', err.message);
    throw err;
  }
}

module.exports = { getAddressFromCoordinates };