import { GooglePlacesProvider } from './googlePlacesProvider.js';
import { MockBusinessProvider } from './mockBusinessProvider.js';
import { config } from '../../config/env.js';

let activeProvider = null;

/**
 * Returns the configured business search provider.
 * Automatically chooses GooglePlacesProvider if API key is present,
 * or MockBusinessProvider with a clear notification.
 */
export function getBusinessProvider() {
  if (config.googlePlacesApiKey && config.googlePlacesApiKey !== 'YOUR_GOOGLE_PLACES_API_KEY') {
    if (!activeProvider || activeProvider.name !== 'google_places_new') {
      console.log('✅ [Provider] Using Google Places API (New) Provider');
      activeProvider = new GooglePlacesProvider(config.googlePlacesApiKey);
    }
    return activeProvider;
  }

  if (!activeProvider || activeProvider.name !== 'mock_provider') {
    console.log('ℹ️ [Provider] No GOOGLE_PLACES_API_KEY set. Using Realistic Mock Business Provider.');
    activeProvider = new MockBusinessProvider();
  }
  return activeProvider;
}
