/**
 * ntfy push provider.
 *
 * Provides WebDAV Push message reception through an ntfy UnifiedPush endpoint.
 */

import { log } from '$lib/caldav/utils';
import { base64UrlEncode, generateWebPushKeyPair } from '$lib/push/webPushKeys';
import type { Calendar } from '$types';
import {
  NTFY_DIRECT_PROVIDER_ID,
  type NtfyProviderConfig,
  type PushEndpointSubscription,
  type PushMessageHandler,
  type PushProviderSubscriptionDiagnostics,
  type PushSubscription,
  type WebPushKeyPair,
} from '$types/push';

export const DEFAULT_NTFY_SERVER_URL = 'https://ntfy.sh';
const DEFAULT_NTFY_PROVIDER_CONFIG: NtfyProviderConfig = {
  serverUrl: DEFAULT_NTFY_SERVER_URL,
  topicPrefix: 'up',
};

export const normalizeNtfyProviderServerUrl = (serverUrl?: string | null): string => {
  const trimmed = serverUrl?.trim();
  if (!trimmed) return DEFAULT_NTFY_SERVER_URL;

  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    url.hash = '';
    url.search = '';
    url.pathname = url.pathname.replace(/\/+$/, '');

    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_NTFY_SERVER_URL;
  }
};

export const createNtfyProviderConfig = (serverUrl?: string | null): NtfyProviderConfig => ({
  ...DEFAULT_NTFY_PROVIDER_CONFIG,
  serverUrl: normalizeNtfyProviderServerUrl(serverUrl),
});

const joinNtfyUrl = (serverUrl: string, path: string): string =>
  `${serverUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

export const getNtfyProviderSseUrl = (endpoint: string): string => joinNtfyUrl(endpoint, 'sse');

export const isNtfyProviderPushResource = (
  pushResource: string,
  config: NtfyProviderConfig,
): boolean => {
  try {
    const pushUrl = new URL(pushResource);
    const serverUrl = new URL(config.serverUrl);
    const serverPath = serverUrl.pathname.replace(/\/+$/, '');
    const pathMatches =
      serverPath === '' ||
      serverPath === '/' ||
      pushUrl.pathname === serverPath ||
      pushUrl.pathname.startsWith(`${serverPath}/`);

    return pushUrl.origin === serverUrl.origin && pathMatches;
  } catch {
    return false;
  }
};

/**
 * Active local ntfy subscription state.
 */
interface NtfyProviderSubscription {
  /** ntfy topic */
  topic: string;
  /** Full push endpoint URL */
  endpoint: string;
  /** Key pair for Web Push registration */
  keyPair: WebPushKeyPair;
  /** EventSource for receiving messages */
  eventSource?: EventSource;
  /** When the current listener was started */
  listenerStartedAt?: Date;
  /** Last successful SSE connection */
  lastConnectedAt?: Date;
  /** Last received WebDAV Push message */
  lastMessageAt?: Date;
  /** Number of WebDAV Push messages received in this app runtime */
  receivedMessages: number;
  /** Last provider/listener error in this app runtime */
  lastError?: string;
  /** When the last provider/listener error happened */
  lastErrorAt?: Date;
}

const activeNtfyProviderSubscriptions = new Map<string, NtfyProviderSubscription>();
let receivedMessageCount = 0;
let lastMessageAt: Date | null = null;

const formatProviderError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'type' in error) {
    return `EventSource ${String((error as { type?: unknown }).type)}`;
  }
  return String(error);
};

const setNtfyProviderError = (subscription: NtfyProviderSubscription, error: unknown): void => {
  subscription.lastError = formatProviderError(error);
  subscription.lastErrorAt = new Date();
};

const generateNtfyProviderTopic = (
  config: NtfyProviderConfig = DEFAULT_NTFY_PROVIDER_CONFIG,
): string => {
  // ntfy's UnifiedPush subscriber-based rate limiting expects topics that:
  // - start with "up"
  // - are exactly 14 chars long
  const randomBytes = crypto.getRandomValues(new Uint8Array(9));
  const suffix = base64UrlEncode(randomBytes).slice(0, 12);
  return `${config.topicPrefix}${suffix}`;
};

const createActiveNtfyProviderSubscription = async (
  calendar: Calendar,
  config: NtfyProviderConfig = DEFAULT_NTFY_PROVIDER_CONFIG,
): Promise<NtfyProviderSubscription> => {
  const existing = activeNtfyProviderSubscriptions.get(calendar.id);
  if (existing) {
    log.debug(`Already subscribed to ntfy for calendar ${calendar.displayName}`);
    return existing;
  }

  const keyPair = await generateWebPushKeyPair();
  const topic = generateNtfyProviderTopic(config);
  const endpoint = joinNtfyUrl(config.serverUrl, topic);

  const subscription: NtfyProviderSubscription = {
    topic,
    endpoint,
    keyPair,
    receivedMessages: 0,
  };

  activeNtfyProviderSubscriptions.set(calendar.id, subscription);
  log.info(`Created ntfy subscription for ${calendar.displayName}: ${endpoint}`);

  return subscription;
};

/**
 * Create an ntfy provider subscription for CalDAV registration.
 */
export const createNtfyProviderSubscription = async (
  calendar: Calendar,
  config: NtfyProviderConfig = DEFAULT_NTFY_PROVIDER_CONFIG,
): Promise<PushEndpointSubscription | null> => {
  await createActiveNtfyProviderSubscription(calendar, config);
  return getNtfyProviderEndpointSubscription(calendar.id);
};

/**
 * Restore an ntfy provider subscription using an existing push endpoint.
 */
export const restoreNtfyProviderSubscription = async (
  subscription: PushSubscription,
  calendar: Calendar,
): Promise<boolean> => {
  const existing = activeNtfyProviderSubscriptions.get(subscription.calendarId);
  if (existing) {
    log.debug(`Already subscribed to ntfy for calendar ${calendar.displayName}`);
    return true;
  }

  let topic: string;
  try {
    const url = new URL(subscription.pushResource);
    topic = url.pathname.slice(1);
  } catch {
    log.error(`Invalid push resource URL: ${subscription.pushResource}`);
    return false;
  }

  const keyPair = await generateWebPushKeyPair();
  const ntfySubscription: NtfyProviderSubscription = {
    topic,
    endpoint: subscription.pushResource,
    keyPair,
    receivedMessages: 0,
  };

  activeNtfyProviderSubscriptions.set(subscription.calendarId, ntfySubscription);
  log.info(`Restored ntfy subscription for ${calendar.displayName}: ${subscription.pushResource}`);

  return true;
};

export const isNtfyProviderListening = (calendarId: string): boolean => {
  const subscription = activeNtfyProviderSubscriptions.get(calendarId);
  return !!subscription?.eventSource;
};

/**
 * Start listening for push messages on an ntfy provider subscription.
 */
export const startNtfyProviderListening = (
  subscription: PushSubscription,
  onMessage: PushMessageHandler,
): boolean => {
  const ntfySubscription = activeNtfyProviderSubscriptions.get(subscription.calendarId);
  if (!ntfySubscription) {
    log.warn(`No subscription found for calendar ${subscription.calendarId}`);
    return false;
  }

  if (ntfySubscription.eventSource) {
    log.debug(`Already listening for calendar ${subscription.calendarId}`);
    return true;
  }

  const sseUrl = getNtfyProviderSseUrl(ntfySubscription.endpoint);
  const eventSource = new EventSource(sseUrl);
  ntfySubscription.listenerStartedAt = new Date();

  eventSource.onopen = () => {
    ntfySubscription.lastConnectedAt = new Date();
    ntfySubscription.lastError = undefined;
    ntfySubscription.lastErrorAt = undefined;
    log.info(`Connected to ntfy SSE for topic ${ntfySubscription.topic}`);
  };

  eventSource.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      const messageLength = typeof data.message === 'string' ? data.message.length : 0;
      log.debug(
        `ntfy SSE event received (type=${data.event}, topic=${data.topic ?? ntfySubscription.topic}, encoding=${data.encoding ?? 'plain'}, messageBytes=${messageLength})`,
      );

      if (data.event === 'message') {
        receivedMessageCount++;
        lastMessageAt = new Date();
        ntfySubscription.receivedMessages++;
        ntfySubscription.lastMessageAt = lastMessageAt;
        ntfySubscription.lastError = undefined;
        ntfySubscription.lastErrorAt = undefined;
        log.info(`Received push message for calendar ${subscription.calendarId}`);

        const messageContent =
          data.message || data.attachment?.name || 'WebDAV Push message received';
        onMessage(subscription.calendarId, messageContent);
      }
    } catch (error) {
      setNtfyProviderError(ntfySubscription, error);
      log.warn('Failed to parse ntfy message:', error);
    }
  };

  eventSource.onerror = (error) => {
    setNtfyProviderError(ntfySubscription, error);
    log.error(`ntfy SSE error for topic ${ntfySubscription.topic}:`, error);
  };

  ntfySubscription.eventSource = eventSource;
  return true;
};

export const stopNtfyProviderListening = (calendarId: string): void => {
  const subscription = activeNtfyProviderSubscriptions.get(calendarId);
  if (subscription?.eventSource) {
    subscription.eventSource.close();
    subscription.eventSource = undefined;
    subscription.listenerStartedAt = undefined;
    log.info(`Stopped listening for calendar ${calendarId}`);
  }
};

export const removeNtfyProviderSubscription = (subscription: PushSubscription): void => {
  stopNtfyProviderListening(subscription.calendarId);
  activeNtfyProviderSubscriptions.delete(subscription.calendarId);
  log.info(`Removed ntfy subscription for calendar ${subscription.calendarId}`);
};

export const getNtfyProviderPushEndpoint = (calendarId: string): string | null => {
  return activeNtfyProviderSubscriptions.get(calendarId)?.endpoint ?? null;
};

export const getNtfyProviderEndpointSubscription = (
  calendarId: string,
): PushEndpointSubscription | null => {
  const subscription = activeNtfyProviderSubscriptions.get(calendarId);
  if (!subscription) return null;

  return {
    providerId: NTFY_DIRECT_PROVIDER_ID,
    pushResource: subscription.endpoint,
    subscriptionPublicKey: subscription.keyPair.publicKey,
    authSecret: subscription.keyPair.authSecret,
    contentEncoding: 'aes128gcm',
  };
};

export const isNtfyProviderAvailable = async (
  config: NtfyProviderConfig = DEFAULT_NTFY_PROVIDER_CONFIG,
): Promise<boolean> => {
  try {
    const response = await fetch(`${config.serverUrl}/v1/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const getNtfyProviderActiveSubscriptionCount = (): number => {
  return activeNtfyProviderSubscriptions.size;
};

interface NtfyProviderDiagnostics {
  activeSubscriptions: number;
  receivedMessages: number;
  lastMessageAt: Date | null;
}

export const getNtfyProviderDiagnostics = (): NtfyProviderDiagnostics => {
  return {
    activeSubscriptions: activeNtfyProviderSubscriptions.size,
    receivedMessages: receivedMessageCount,
    lastMessageAt,
  };
};

export const getNtfyProviderSubscriptionDiagnostics = (
  calendarId: string,
): PushProviderSubscriptionDiagnostics | null => {
  const subscription = activeNtfyProviderSubscriptions.get(calendarId);
  if (!subscription) return null;

  return {
    calendarId,
    providerId: NTFY_DIRECT_PROVIDER_ID,
    listening: !!subscription.eventSource,
    listenerStartedAt: subscription.listenerStartedAt ?? null,
    lastConnectedAt: subscription.lastConnectedAt ?? null,
    lastMessageAt: subscription.lastMessageAt ?? null,
    receivedMessages: subscription.receivedMessages,
    lastError: subscription.lastError ?? null,
    lastErrorAt: subscription.lastErrorAt ?? null,
  };
};

export const stopAllNtfyProviderListeners = (): void => {
  for (const calendarId of activeNtfyProviderSubscriptions.keys()) {
    stopNtfyProviderListening(calendarId);
  }
  activeNtfyProviderSubscriptions.clear();
  log.info('Stopped all ntfy subscriptions');
};
