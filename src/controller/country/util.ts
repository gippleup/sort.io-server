import fetch from 'node-fetch';
import dotenv from 'dotenv'
dotenv.config({
  path: '../../../.env'
})

export const getCountryNameFromLatLng: (lat: number, lng: number) => Promise<string> = (lat, lng) => {
  const baseurl = 'https://maps.googleapis.com/maps/api/geocode/json';
  const apiKey = process.env.GOOGLE_API_KEY;
  return fetch(`${baseurl}?latlng=${lat},${lng}&key=${apiKey}`)
    .then((res) => res.json())
    .then((json) => {
      if (!json.results.length) {
        return '';
      }
      return json.results[0].formatted_address.split(', ').pop()
    })
}

export const getIconNameFromCountry = (country: string) => {
  const iconName = country.split(' ').join('-').toLowerCase();
  return iconName;
}