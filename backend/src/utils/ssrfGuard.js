import dns from 'node:dns/promises';
import { URL } from 'node:url';

/**
 * Checks whether an IPv4 address falls within private, loopback, or reserved ranges.
 */
function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP is treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 10.0.0.0/8 (Private-Use)
  if (a === 10) return true;
  // 172.16.0.0/12 (Private-Use: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private-Use)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link Local, Cloud Metadata: AWS/GCP 169.254.169.254)
  if (a === 169 && b === 254) return true;
  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 224.0.0.0/4 (Multicast) and 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks whether an IPv6 address falls within loopback or private/local ranges.
 */
function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true; // Link-local
  if (normalized.startsWith('fc00:') || normalized.startsWith('fd00:') || normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // Unique local
  if (normalized.startsWith('::ffff:')) {
    // IPv4-mapped IPv6
    const ipv4Part = normalized.replace('::ffff:', '');
    return isPrivateIPv4(ipv4Part);
  }
  return false;
}

/**
 * Validates a target URL against SSRF threats.
 * Resolves hostname through DNS and verifies the target IP is public.
 */
export async function validateUrlForSsrf(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (err) {
    return { isSafe: false, reason: 'Invalid URL format' };
  }

  // Scheme check - only http and https allowed
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isSafe: false, reason: `Unsupported protocol: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost keywords
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { isSafe: false, reason: 'Localhost and internal hostnames are prohibited' };
  }

  // If hostname is directly an IPv4 address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { isSafe: false, reason: 'Target resolved to private or reserved IP address' };
    }
    return { isSafe: true, hostname, resolvedIp: hostname, normalizedUrl: parsed.href };
  }

  // DNS resolution check
  try {
    const lookupResult = await dns.lookup(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      return { isSafe: false, reason: 'DNS resolution returned no records' };
    }

    for (const record of lookupResult) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        return { isSafe: false, reason: `IP ${record.address} is in a private network range` };
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        return { isSafe: false, reason: `IPv6 ${record.address} is in a private/local range` };
      }
    }

    return {
      isSafe: true,
      hostname,
      resolvedIp: lookupResult[0].address,
      normalizedUrl: parsed.href
    };
  } catch (dnsErr) {
    return { isSafe: false, reason: `DNS resolution failed: ${dnsErr.code || dnsErr.message}` };
  }
}
