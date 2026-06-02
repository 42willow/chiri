/**
 * Utility functions for parsing Apple Configuration Profile (.mobileconfig) files
 */

import type { ServerType } from '$types';

export interface MobileConfigCalDAVSettings {
  accountName?: string;
  serverUrl?: string;
  username?: string;
  password?: string;
  principalUrl?: string;
  serverType?: ServerType;
}

export type MobileConfigParseFailureReason =
  | 'invalid-xml'
  | 'missing-payload-content'
  | 'missing-caldav-payload'
  | 'unexpected-error';

export type MobileConfigParseResult =
  | { ok: true; config: MobileConfigCalDAVSettings }
  | { ok: false; reason: MobileConfigParseFailureReason };

/**
 * Detect server type based on hostname and principal URL
 *
 * Detection is based on CalDAVPrincipalURL patterns found in .mobileconfig files.
 * Each server type has a distinct URL structure verified from their source code:
 * - Baikal: /dav.php/principals/{username}/
 * - Radicale: /{username}/ (simple flat structure at root)
 * - Nextcloud: /remote.php/dav/principals/users/{username}/
 * - RustiCal: /caldav/principal/{username}/
 */
const detectServerType = (hostname: string | null, principalUrl: string | null): ServerType => {
  // Check hostname patterns first (managed services)
  if (hostname) {
    const host = hostname.toLowerCase();
    if (host.includes('fastmail.com')) return 'fastmail';
    if (host.includes('mailbox.org')) return 'mailbox';
    if (host.includes('migadu.com')) return 'migadu';
    if (host.includes('purelymail.com')) return 'purelymail';
    if (host.includes('runbox.com')) return 'runbox';
  }

  // Check principal URL path pattern
  if (principalUrl) {
    let pathname = principalUrl.toLowerCase();
    try {
      pathname = new URL(principalUrl).pathname.toLowerCase();
    } catch {
      // already relative; use as-is
    }

    // RustiCal: /caldav/principal/{username}/
    if (pathname.includes('/caldav/principal/')) return 'rustical';

    // Nextcloud: /remote.php/dav/principals/users/{username}/
    // Also matches calendar home: /remote.php/dav/calendars/{username}/
    if (pathname.includes('/remote.php/dav/')) return 'nextcloud';

    // Baikal: /dav.php/principals/{username}/
    // Also matches calendars: /dav.php/calendars/{username}/
    if (pathname.includes('/dav.php/principals/')) return 'baikal';

    // Radicale: /{username}/ (simple flat structure)
    // Radicale uses a minimalist structure with users at root level
    const pathParts = pathname.split('/').filter((p) => p.length > 0);
    if (pathParts.length <= 2 && !pathname.includes('.php') && !pathname.includes('/dav/')) {
      return 'radicale';
    }
  }

  // Default to generic (auto-detect using .well-known/caldav)
  return 'generic';
};

/**
 * Parse an Apple Configuration Profile XML and extract CalDAV settings.
 */
export const parseAppleConfigProfileResult = (xmlContent: string): MobileConfigParseResult => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // DOMParser reports invalid XML by adding a parsererror element instead of throwing.
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return { ok: false, reason: 'invalid-xml' };
    }

    // Find all dict elements in PayloadContent array
    const payloadContent = xmlDoc.querySelector('plist > dict > array');
    if (!payloadContent) {
      return { ok: false, reason: 'missing-payload-content' };
    }

    // Find the CalDAV payload dict
    const dicts = payloadContent.querySelectorAll('dict');
    let caldavDict: Element | null = null;

    for (const dict of Array.from(dicts)) {
      const keys = dict.querySelectorAll('key');
      for (const key of Array.from(keys)) {
        if (key.textContent === 'PayloadType') {
          const nextElement = key.nextElementSibling;
          if (
            nextElement?.tagName === 'string' &&
            nextElement.textContent === 'com.apple.caldav.account'
          ) {
            caldavDict = dict;
            break;
          }
        }
      }
      if (caldavDict) break;
    }

    if (!caldavDict) {
      return { ok: false, reason: 'missing-caldav-payload' };
    }

    // Helper to get value from plist dict
    const getValue = (dict: Element, keyName: string) => {
      const keys = dict.querySelectorAll('key');
      for (const key of Array.from(keys)) {
        if (key.textContent === keyName) {
          const nextElement = key.nextElementSibling;
          if (nextElement?.tagName === 'string') {
            return nextElement.textContent;
          }
          if (nextElement?.tagName === 'true') {
            return 'true';
          }
          if (nextElement?.tagName === 'false') {
            return 'false';
          }
        }
      }
      return null;
    };

    // Extract CalDAV configuration
    const hostname = getValue(caldavDict, 'CalDAVHostName');
    const username = getValue(caldavDict, 'CalDAVUsername');
    const password = getValue(caldavDict, 'CalDAVPassword');
    const principalUrl = getValue(caldavDict, 'CalDAVPrincipalURL');
    const useSSL = getValue(caldavDict, 'CalDAVUseSSL');
    const accountDescription = getValue(caldavDict, 'CalDAVAccountDescription');

    // Build server URL from hostname
    let serverUrl = '';
    if (hostname) {
      const protocol = useSSL === 'true' ? 'https' : 'http';
      serverUrl = `${protocol}://${hostname}`;
    }

    // If principalUrl is available, use it as the server URL
    if (principalUrl) {
      try {
        const url = new URL(principalUrl);
        serverUrl = `${url.protocol}//${url.host}`;
      } catch {
        // If parsing fails, keep the constructed serverUrl
      }
    }

    const serverType = detectServerType(hostname, principalUrl);

    return {
      ok: true,
      config: {
        accountName: accountDescription || username || undefined,
        serverUrl: serverUrl || undefined,
        username: username || undefined,
        password: password || undefined,
        principalUrl: principalUrl || undefined,
        serverType,
      },
    };
  } catch {
    return { ok: false, reason: 'unexpected-error' };
  }
};

/**
 * Parse an Apple Configuration Profile XML and extract CalDAV settings.
 */
export const parseAppleConfigProfile = (xmlContent: string): MobileConfigCalDAVSettings | null => {
  const result = parseAppleConfigProfileResult(xmlContent);

  return result.ok ? result.config : null;
};
