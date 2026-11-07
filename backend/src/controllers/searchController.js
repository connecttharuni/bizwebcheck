import { getBusinessProvider } from '../services/providers/providerFactory.js';
import { verifyWebsite, WEBSITE_STATUS } from '../services/websiteVerifier.js';
import { Store } from '../services/store.js';
import { generateCsv, generateExcelBuffer } from '../utils/exportHelper.js';

export async function searchSingleBusiness(req, res) {
  const startTime = Date.now();
  const userId = req.user._id;

  try {
    const { businessName, city, state, country, category } = req.body;

    if (!businessName && !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a business name or category to search.'
      });
    }

    const provider = getBusinessProvider();
    let places = [];
    let apiError = null;

    try {
      places = await provider.searchBusinesses({
        query: businessName,
        city,
        state,
        country: country || 'India',
        category,
        limit: 5 // Get top matches for single search
      });

      await Store.logApiUsage({
        provider: provider.name,
        endpoint: 'searchText',
        method: 'POST',
        requestedBy: userId,
        query: `${businessName || ''} in ${city || ''} (${category || ''})`,
        status: 'success',
        httpStatus: 200,
        responseDurationMs: Date.now() - startTime,
        fieldsRequested: ['id', 'displayName', 'formattedAddress', 'primaryType', 'websiteUri', 'googleMapsUri']
      });
    } catch (err) {
      apiError = err.message;
      await Store.logApiUsage({
        provider: provider.name,
        endpoint: 'searchText',
        method: 'POST',
        requestedBy: userId,
        query: `${businessName || ''} in ${city || ''}`,
        status: err.message.includes('quota') ? 'quota_exceeded' : 'error',
        httpStatus: 500,
        responseDurationMs: Date.now() - startTime,
        fieldsRequested: [],
        errorMessage: err.message
      });
      throw err;
    }

    // If no business found
    if (!places || places.length === 0) {
      const notFoundResult = {
        name: businessName || 'Unknown Business',
        location: [city, state, country].filter(Boolean).join(', ') || 'Not specified',
        category: category || 'General',
        businessFound: false,
        websiteStatus: WEBSITE_STATUS.BUSINESS_NOT_FOUND,
        websiteUrl: null,
        recommendation: 'No matching registered business found in this location. Verify spelling or check alternate nearby cities.',
        opportunityScore: 0,
        verificationDetails: {
          details: 'Zero places returned by the business provider.'
        },
        verifiedAt: new Date().toISOString()
      };

      // Record in search history
      await Store.addSearchHistory({
        user: userId,
        searchType: 'single',
        query: { businessName, city, state, country, category },
        resultsCount: 0,
        opportunitiesFound: 0,
        resultsSnapshot: [notFoundResult]
      });

      // Deduct 1 search credit
      await Store.incrementSearchUsage(userId, 1);

      return res.json({
        success: true,
        businessFound: false,
        results: [notFoundResult]
      });
    }

    // Verify each returned place through our strict SSRF-safe Website Verifier
    const verifiedResults = [];
    let opportunitiesCount = 0;

    for (const place of places) {
      const verification = await verifyWebsite(place.websiteUri);
      if (verification.status === WEBSITE_STATUS.NOT_LISTED || verification.status === WEBSITE_STATUS.UNREACHABLE) {
        opportunitiesCount++;
      }

      verifiedResults.push({
        placeId: place.placeId,
        businessName: place.name,
        location: place.address,
        city: city || '',
        category: place.category,
        googleMapsUri: place.googleMapsUri,
        businessFound: true,
        websiteStatus: verification.status,
        websiteUrl: verification.url,
        finalUrl: verification.finalUrl,
        verificationStatus: verification.accessible ? 'Reachable' : 'Unreachable / Not listed',
        httpStatus: verification.httpStatus,
        responseTimeMs: verification.responseTimeMs,
        recommendation: verification.recommendation,
        opportunityScore: verification.opportunityScore,
        verificationDetails: {
          dnsResolved: verification.dnsResolved,
          httpStatus: verification.httpStatus,
          redirectsFollowed: verification.redirectsFollowed,
          details: verification.details
        },
        lastChecked: verification.verifiedAt
      });
    }

    // Increment usage
    await Store.incrementSearchUsage(userId, 1);

    // Save Search History
    await Store.addSearchHistory({
      user: userId,
      searchType: 'single',
      query: { businessName, city, state, country, category },
      resultsCount: verifiedResults.length,
      opportunitiesFound: opportunitiesCount,
      resultsSnapshot: verifiedResults
    });

    return res.json({
      success: true,
      businessFound: true,
      primaryResult: verifiedResults[0],
      results: verifiedResults,
      count: verifiedResults.length,
      opportunitiesCount
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error occurred during business search'
    });
  }
}

export async function bulkSearchBusinesses(req, res) {
  const startTime = Date.now();
  const userId = req.user._id;

  try {
    const { city, category, state, country, limit = 20 } = req.body;

    if (!city || !category) {
      return res.status(400).json({
        success: false,
        message: 'Both city and business category are required for bulk search.'
      });
    }

    const requestedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const provider = getBusinessProvider();
    const places = await provider.searchBusinesses({
      query: `${category} in ${city}`,
      city,
      state,
      country: country || 'India',
      category,
      limit: requestedLimit
    });

    await Store.logApiUsage({
      provider: provider.name,
      endpoint: 'searchTextBulk',
      method: 'POST',
      requestedBy: userId,
      query: `Bulk: ${category} in ${city}`,
      status: 'success',
      httpStatus: 200,
      responseDurationMs: Date.now() - startTime,
      fieldsRequested: ['id', 'displayName', 'formattedAddress', 'primaryType', 'websiteUri', 'googleMapsUri']
    });

    const results = [];
    let opportunitiesCount = 0;

    // Process each business and verify website status
    for (const place of places) {
      const verification = await verifyWebsite(place.websiteUri);
      const isOpportunity = verification.status === WEBSITE_STATUS.NOT_LISTED || verification.status === WEBSITE_STATUS.UNREACHABLE;
      if (isOpportunity) opportunitiesCount++;

      results.push({
        placeId: place.placeId,
        businessName: place.name,
        location: place.address,
        city,
        category: place.category || category,
        googleMapsUri: place.googleMapsUri,
        businessFound: true,
        websiteStatus: verification.status,
        websiteUrl: verification.url,
        finalUrl: verification.finalUrl,
        verificationStatus: verification.accessible ? 'Reachable' : 'Not Reachable',
        httpStatus: verification.httpStatus,
        responseTimeMs: verification.responseTimeMs,
        recommendation: verification.recommendation,
        opportunityScore: verification.opportunityScore,
        verificationDetails: {
          dnsResolved: verification.dnsResolved,
          httpStatus: verification.httpStatus,
          redirectsFollowed: verification.redirectsFollowed,
          details: verification.details
        },
        lastChecked: verification.verifiedAt
      });
    }

    // Deduct used credits equal to number of items retrieved
    const creditsUsed = results.length || 1;
    await Store.incrementSearchUsage(userId, creditsUsed);

    // Save Search History
    await Store.addSearchHistory({
      user: userId,
      searchType: 'bulk',
      query: { city, category, state, country },
      resultsCount: results.length,
      opportunitiesFound: opportunitiesCount,
      resultsSnapshot: results
    });

    return res.json({
      success: true,
      city,
      category,
      count: results.length,
      opportunitiesCount,
      creditsUsed,
      results
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Bulk search execution failed: ' + err.message
    });
  }
}

export async function exportSearchResults(req, res) {
  try {
    const { results, format = 'csv' } = req.body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: 'No search results provided to export' });
    }

    const exportFields = [
      { label: 'Business Name', key: 'businessName' },
      { label: 'Category', key: 'category' },
      { label: 'Location', key: 'location' },
      { label: 'Website Status', key: 'websiteStatus' },
      { label: 'Website URL', key: 'websiteUrl' },
      { label: 'Opportunity Score', key: 'opportunityScore' },
      { label: 'Recommendation', key: 'recommendation' },
      { label: 'Last Checked', key: 'lastChecked' },
      { label: 'Google Maps Link', key: 'googleMapsUri' }
    ];

    if (format.toLowerCase() === 'xlsx' || format.toLowerCase() === 'excel') {
      const buffer = generateExcelBuffer(results, exportFields, 'BizWebCheck Opportunities');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bizwebcheck_export.xlsx"');
      return res.send(buffer);
    }

    // CSV format
    const csvData = generateCsv(results, exportFields);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bizwebcheck_export.csv"');
    return res.send(csvData);

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Export failed: ' + err.message });
  }
}

export async function getSearchHistory(req, res) {
  try {
    const history = await Store.getSearchHistoryByUserId(req.user._id);
    return res.json({ success: true, history });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch search history' });
  }
}
