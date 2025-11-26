import axios from 'axios';
import config from '../config/config';

const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export const searchAddress = async (query) => {
    if (!query) return [];
    try {
        const response = await axios.get(`${MAPBOX_GEOCODING_URL}/${encodeURIComponent(query)}.json`, {
            params: {
                access_token: config.mapboxToken,
                types: 'address,poi',
                limit: 5
            }
        });
        return response.data.features;
    } catch (error) {
        console.error('Error searching address:', error);
        return [];
    }
};

export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await axios.get(`${MAPBOX_GEOCODING_URL}/${lng},${lat}.json`, {
            params: {
                access_token: config.mapboxToken,
                types: 'address,poi',
                limit: 1
            }
        });
        if (response.data.features && response.data.features.length > 0) {
            return response.data.features[0].place_name;
        }
        return null;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
};
