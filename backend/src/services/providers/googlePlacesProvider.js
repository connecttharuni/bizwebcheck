import axios from 'axios';
import { BaseBusinessProvider } from './baseProvider.js';

/**
 * Google Places API (New) Provider
 * Uses Text Search (New) endpoint with precise FieldMask to request only authorized fields.
 * Endpoint: POST https://places.googleapis.com/v1/places:searchText
 * Headers:
 *   X-Goog-Api-Key: <API_KEY>
 *   X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.primaryType,places.types,places.websiteUri,places.googleMapsUri
 */
export class GooglePlacesProvider extends BaseBusinessProvider {
  constructor(apiKey) {
    super('google_places_new');
    this.apiKey = apiKey;
    this.endpoint = 'https://places.googleapis.com/v1/places:searchText';
    this.fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.primaryType',
      'places.types',
      'places.websiteUri',
      'places.googleMapsUri'
    ].join(',');
  }

  async searchBusinesses({ query, city, state, country, category, limit = 10 }) {
    if (!this.apiKey) {
      throw new Error('Google Places API Key is not configured.');
    }

    // Build the search text query
    const terms = [];
    if (query) terms.push(query.trim());
    if (category && !terms.includes(category)) terms.push(category.trim());
    if (city) terms.push(city.trim());
    if (state) terms.push(state.trim());
    if (country) terms.push(country.trim());

    const textQuery = terms.join(', ') || query || 'business';

    const payload = {
      textQuery,
      pageSize: Math.min(Math.max(limit, 1), 20) // Google Places New pageSize max is 20
    };

    if (category) {
      // Optional category hint if standard type
      payload.includedType = category.toLowerCase().replace(/\s+/g, '_');
    }

    try {
      const response = await axios.post(this.endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': this.fieldMask
        },
        timeout: 10000
      });

      const places = response.data?.places || [];

      return places.map(place => ({
        placeId: place.id,
        name: place.displayName?.text || 'Unknown Business',
        address: place.formattedAddress || 'Address not listed',
        category: place.primaryType || (place.types && place.types[0]) || category || 'General Business',
        websiteUri: place.websiteUri || null,
        googleMapsUri: place.googleMapsUri || null,
        provider: 'google_places_new',
        rawPlaceData: {
          types: place.types
        }
      }));
    } catch (err) {
      const status = err.response?.status;
      const errorData = err.response?.data?.error;
      const message = errorData?.message || err.message;

      if (status === 403) {
        throw new Error(`Google Places API authorization failure: ${message}. Check API key and Places API (New) enabled in Google Cloud Console.`);
      } else if (status === 429) {
        throw new Error('Google Places API quota/rate limit exceeded. Please retry in a few moments.');
      } else if (status === 400) {
        throw new Error(`Google Places API bad request: ${message}`);
      }

      throw new Error(`Google Places API search failed: ${message}`);
    }
  }
}
