import axios from 'axios';
import { validateUrlForSsrf } from '../utils/ssrfGuard.js';
import { config } from '../config/env.js';

export const WEBSITE_STATUS = {
  FOUND: 'Website Found',
  NOT_LISTED: 'Website Not Listed',
  UNREACHABLE: 'Website Unreachable',
  UNABLE_TO_VERIFY: 'Unable to Verify',
  BUSINESS_NOT_FOUND: 'Business Not Found'
};

/**
 * Normalizes URL string, adding https:// if protocol is missing.
 */
export function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Verifies the existence, DNS resolution, and HTTP reachable status of a website URL.
 * Implements strict SSRF prevention, redirect checking, and timeout control.
 *
 * @param {string|null} rawUrl - Website URL provided by the business data source
 * @returns {Promise<object>} Verification report
 */
export async function verifyWebsite(rawUrl) {
  const verifiedAt = new Date().toISOString();

  // Scenario 1: Business provider returned no website URL
  if (!rawUrl || !rawUrl.trim()) {
    return {
      status: WEBSITE_STATUS.NOT_LISTED,
      url: null,
      accessible: false,
      httpStatus: null,
      responseTimeMs: 0,
      dnsResolved: false,
      redirectsFollowed: 0,
      recommendation: 'High opportunity: Business has no official website listed. Pitch custom website design and SEO services.',
      opportunityScore: 95,
      details: 'No website URL was returned by the business information provider.',
      verifiedAt
    };
  }

  const normalized = normalizeUrl(rawUrl);

  // Scenario 2: SSRF Guard and DNS validation
  const ssrfCheck = await validateUrlForSsrf(normalized);
  if (!ssrfCheck.isSafe) {
    // If DNS failed completely, mark as Unreachable
    if (ssrfCheck.reason && ssrfCheck.reason.includes('DNS resolution failed')) {
      return {
        status: WEBSITE_STATUS.UNREACHABLE,
        url: normalized,
        accessible: false,
        httpStatus: null,
        responseTimeMs: 0,
        dnsResolved: false,
        redirectsFollowed: 0,
        recommendation: 'DNS domain resolution failed. Domain may be expired, misconfigured, or abandoned.',
        opportunityScore: 85,
        details: ssrfCheck.reason,
        verifiedAt
      };
    }

    // If blocked for security (e.g. private IP/SSRF)
    return {
      status: WEBSITE_STATUS.UNABLE_TO_VERIFY,
      url: normalized,
      accessible: false,
      httpStatus: null,
      responseTimeMs: 0,
      dnsResolved: false,
      redirectsFollowed: 0,
      recommendation: 'Unable to verify URL safely due to security boundaries or private IP configuration.',
      opportunityScore: 50,
      details: ssrfCheck.reason,
      verifiedAt
    };
  }

  // Scenario 3: HTTP/HTTPS Accessibility Probe
  const startTime = Date.now();
  try {
    let currentUrl = normalized;
    let redirectsCount = 0;
    const maxRedirects = config.verifier.maxRedirects || 4;

    const client = axios.create({
      timeout: config.verifier.timeoutMs || 6000,
      maxContentLength: config.verifier.maxBodySize || 1048576, // 1MB
      maxBodyLength: config.verifier.maxBodySize || 1048576,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BizWebCheck-Verifier/1.0 (+https://bizwebcheck.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      maxRedirects: 0, // We handle redirects manually to check SSRF on every hop!
      validateStatus: () => true // Allow all status codes to inspect them
    });

    let response = null;
    let hopUrl = currentUrl;

    while (redirectsCount <= maxRedirects) {
      // Re-verify SSRF on each hop
      const hopCheck = await validateUrlForSsrf(hopUrl);
      if (!hopCheck.isSafe) {
        return {
          status: WEBSITE_STATUS.UNABLE_TO_VERIFY,
          url: normalized,
          accessible: false,
          httpStatus: null,
          responseTimeMs: Date.now() - startTime,
          dnsResolved: true,
          redirectsFollowed: redirectsCount,
          recommendation: 'Redirect target blocked by SSRF security check.',
          opportunityScore: 50,
          details: `Redirect target ${hopUrl} failed security validation: ${hopCheck.reason}`,
          verifiedAt
        };
      }

      response = await client.get(hopUrl);

      // Check if redirect (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
        redirectsCount++;
        const nextUrl = new URL(response.headers.location, hopUrl).href;
        hopUrl = nextUrl;
      } else {
        break; // Final response reached
      }
    }

    const duration = Date.now() - startTime;
    const statusCode = response.status;

    // HTTP 200..399: Active and reachable website
    if (statusCode >= 200 && statusCode < 400) {
      return {
        status: WEBSITE_STATUS.FOUND,
        url: normalized,
        finalUrl: hopUrl,
        accessible: true,
        httpStatus: statusCode,
        responseTimeMs: duration,
        dnsResolved: true,
        redirectsFollowed: redirectsCount,
        recommendation: 'Business has an active website. May offer modernization, SEO, or redesign if outdated.',
        opportunityScore: 20,
        details: `Website responded successfully with HTTP ${statusCode} in ${duration}ms.`,
        verifiedAt
      };
    }

    // HTTP 4xx or 5xx: Website Unreachable
    return {
      status: WEBSITE_STATUS.UNREACHABLE,
      url: normalized,
      finalUrl: hopUrl,
      accessible: false,
      httpStatus: statusCode,
      responseTimeMs: duration,
      dnsResolved: true,
      redirectsFollowed: redirectsCount,
      recommendation: `Website server responded with error HTTP ${statusCode}. Opportunity for website recovery, bug fixing, or hosting migration.`,
      opportunityScore: 80,
      details: `HTTP status ${statusCode} (${response.statusText || 'Error'})`,
      verifiedAt
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorCode = error.code || error.message;

    // Distinguish between hard network failure vs temporary timeout
    if (['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'CERT_HAS_EXPIRED'].includes(errorCode)) {
      return {
        status: WEBSITE_STATUS.UNREACHABLE,
        url: normalized,
        accessible: false,
        httpStatus: null,
        responseTimeMs: duration,
        dnsResolved: errorCode !== 'ENOTFOUND',
        redirectsFollowed: 0,
        recommendation: `Website connection failed (${errorCode}). Opportunity for server repair or SSL certificate renewal.`,
        opportunityScore: 75,
        details: `Connection failed with code: ${errorCode}`,
        verifiedAt
      };
    }

    if (errorCode === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        status: WEBSITE_STATUS.UNABLE_TO_VERIFY,
        url: normalized,
        accessible: false,
        httpStatus: null,
        responseTimeMs: duration,
        dnsResolved: true,
        redirectsFollowed: 0,
        recommendation: 'Website verification timed out. The server might be slow, geo-blocked, or experiencing high load.',
        opportunityScore: 60,
        details: `Request timed out after ${config.verifier.timeoutMs}ms.`,
        verifiedAt
      };
    }

    return {
      status: WEBSITE_STATUS.UNABLE_TO_VERIFY,
      url: normalized,
      accessible: false,
      httpStatus: null,
      responseTimeMs: duration,
      dnsResolved: false,
      redirectsFollowed: 0,
      recommendation: 'Temporary network or verification issue occurred. Re-run verification later.',
      opportunityScore: 40,
      details: error.message || 'Unknown network error',
      verifiedAt
    };
  }
}
