import { BaseBusinessProvider } from './baseProvider.js';

/**
 * Realistic Mock Business Provider
 * Used in development/testing mode or when Google Places API key is not provided.
 * Perfectly demonstrates all status variations:
 * - Website Found
 * - Website Not Listed
 * - Website Unreachable
 * - Unable to Verify
 * - Business Not Found
 */
export class MockBusinessProvider extends BaseBusinessProvider {
  constructor() {
    super('mock_provider');
  }

  async searchBusinesses({ query = '', city = '', state = '', country = '', category = '', limit = 10 }) {
    // Artificial latency for realism
    await new Promise(r => setTimeout(r, 450));

    const q = (query || '').toLowerCase().trim();
    const loc = [city, state, country].filter(Boolean).join(', ') || 'Chennai, India';
    const cleanCity = city || 'Chennai';

    // Curated catalog for predictable demo matches
    const catalog = [
      {
        placeId: 'mock_place_dominos_01',
        name: "Domino's Pizza",
        address: `Shop 4, MG Road, ${cleanCity}, India`,
        category: 'Restaurant',
        websiteUri: 'https://www.dominos.co.in',
        googleMapsUri: 'https://maps.google.com/?cid=1001'
      },
      {
        placeId: 'mock_place_abc_bakery_02',
        name: 'ABC Bakery & Confectionery',
        address: `12 Anna Salai, ${cleanCity}, India`,
        category: 'Bakery',
        websiteUri: null, // Explicitly no website listed
        googleMapsUri: 'https://maps.google.com/?cid=1002'
      },
      {
        placeId: 'mock_place_apollo_hosp_03',
        name: 'Apollo Hospital & Specialty Clinic',
        address: `Lakeview Avenue, ${cleanCity}, India`,
        category: 'Hospital',
        websiteUri: 'https://www.apollohospitals.com',
        googleMapsUri: 'https://maps.google.com/?cid=1003'
      },
      {
        placeId: 'mock_place_naturals_salon_04',
        name: 'Naturals Unisex Beauty Salon',
        address: `Cross Cut Road, ${cleanCity}, India`,
        category: 'Salon',
        websiteUri: 'https://naturals.in',
        googleMapsUri: 'https://maps.google.com/?cid=1004'
      },
      {
        placeId: 'mock_place_sri_krishna_05',
        name: 'Sri Krishna Sweets & Snacks',
        address: `Town Hall Road, ${cleanCity}, India`,
        category: 'Bakery & Sweets',
        websiteUri: null, // No website listed
        googleMapsUri: 'https://maps.google.com/?cid=1005'
      },
      {
        placeId: 'mock_place_unreachable_06',
        name: 'Apex Digital Marketing Agency',
        address: `IT Corridor, OMR, ${cleanCity}, India`,
        category: 'Digital Marketing',
        websiteUri: 'http://this-is-a-definitely-non-existent-expired-domain-bizwebcheck-test.org', // Unreachable domain
        googleMapsUri: 'https://maps.google.com/?cid=1006'
      },
      {
        placeId: 'mock_place_saravana_bhavan_07',
        name: 'Hotel Saravana Traditional Meals',
        address: `North Car Street, ${cleanCity}, India`,
        category: 'Restaurant',
        websiteUri: null, // Opportunity!
        googleMapsUri: 'https://maps.google.com/?cid=1007'
      },
      {
        placeId: 'mock_place_tech_innovations_08',
        name: 'TechWave Web Solutions',
        address: `Indiranagar 100ft Road, ${cleanCity}, India`,
        category: 'IT Services',
        websiteUri: 'https://github.com',
        googleMapsUri: 'https://maps.google.com/?cid=1008'
      },
      {
        placeId: 'mock_place_green_pharmacy_09',
        name: 'Green Cross Meds & Health Store',
        address: `Gandhi Bazaar, ${cleanCity}, India`,
        category: 'Pharmacy',
        websiteUri: null,
        googleMapsUri: 'https://maps.google.com/?cid=1009'
      },
      {
        placeId: 'mock_place_elite_fitness_10',
        name: 'Elite Iron Gym & Fitness Studio',
        address: `Outer Ring Road, ${cleanCity}, India`,
        category: 'Fitness Center',
        websiteUri: null,
        googleMapsUri: 'https://maps.google.com/?cid=1010'
      }
    ];

    // Filter catalog based on user input
    let results = catalog.filter(item => {
      const matchName = !q || item.name.toLowerCase().includes(q) || q.includes(item.name.toLowerCase().split(' ')[0]);
      const matchCat = !category || item.category.toLowerCase().includes(category.toLowerCase());
      return matchName || matchCat;
    });

    // If no direct catalog matches, dynamically synthesize realistic businesses for the user's specific query
    if (results.length === 0 && q) {
      const titleQuery = query.charAt(0).toUpperCase() + query.slice(1);
      const cat = category || 'Commercial Business';
      
      results = [
        {
          placeId: `mock_gen_${Date.now()}_1`,
          name: `${titleQuery}`,
          address: `Main Road, ${cleanCity}, India`,
          category: cat,
          websiteUri: null, // High likelihood of opportunity
          googleMapsUri: 'https://maps.google.com/?q=' + encodeURIComponent(`${titleQuery} ${cleanCity}`)
        },
        {
          placeId: `mock_gen_${Date.now()}_2`,
          name: `${titleQuery} Premier Store`,
          address: `Commercial Street, Sector 4, ${cleanCity}, India`,
          category: cat,
          websiteUri: 'https://example.com',
          googleMapsUri: 'https://maps.google.com/?q=' + encodeURIComponent(`${titleQuery} Premier Store`)
        },
        {
          placeId: `mock_gen_${Date.now()}_3`,
          name: `Royal ${titleQuery}`,
          address: `Station Road, ${cleanCity}, India`,
          category: cat,
          websiteUri: null,
          googleMapsUri: 'https://maps.google.com/?q=' + encodeURIComponent(`Royal ${titleQuery}`)
        }
      ];
    } else if (results.length === 0 && category) {
      // Category search without specific name (e.g. "Restaurants in Chennai", "Hospitals in Coimbatore")
      const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
      results = [
        {
          placeId: `mock_cat_${Date.now()}_1`,
          name: `Classic ${catTitle} Hub`,
          address: `MG Road, ${cleanCity}`,
          category: category,
          websiteUri: null,
          googleMapsUri: 'https://maps.google.com'
        },
        {
          placeId: `mock_cat_${Date.now()}_2`,
          name: `Grand ${catTitle} & Co.`,
          address: `Central Avenue, ${cleanCity}`,
          category: category,
          websiteUri: 'https://example.com',
          googleMapsUri: 'https://maps.google.com'
        },
        {
          placeId: `mock_cat_${Date.now()}_3`,
          name: `Star ${catTitle} Express`,
          address: `Station Road, ${cleanCity}`,
          category: category,
          websiteUri: null,
          googleMapsUri: 'https://maps.google.com'
        },
        {
          placeId: `mock_cat_${Date.now()}_4`,
          name: `${cleanCity} Prime ${catTitle}`,
          address: `Ring Road, ${cleanCity}`,
          category: category,
          websiteUri: null,
          googleMapsUri: 'https://maps.google.com'
        },
        {
          placeId: `mock_cat_${Date.now()}_5`,
          name: `Elite ${catTitle} Lounge`,
          address: `Bypass Junction, ${cleanCity}`,
          category: category,
          websiteUri: 'http://this-is-a-definitely-non-existent-expired-domain-bizwebcheck-test.org',
          googleMapsUri: 'https://maps.google.com'
        }
      ];
    }

    return results.slice(0, limit).map(item => ({
      ...item,
      provider: 'mock_provider'
    }));
  }
}
