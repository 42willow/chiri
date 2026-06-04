import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { log } from '$lib/caldav/utils';
import { generateWebPushKeyPair } from '$lib/push/webPushKeys';
import type { Calendar } from '$types';
import {
  LINUX_UNIFIED_PUSH_PROVIDER_ID,
  type PushEndpointSubscription,
  type PushMessageHandler,
  type PushSubscription,
} from '$types/push';
import { generateUUID } from '$utils/misc';

interface LinuxUnifiedPushProviderRegistration {
  endpoint: string;
  token: string;
  distributor: string;
}

interface LinuxUnifiedPushProviderMessageEvent {
  token: string;
  message: string;
  messageBytes: number;
}

interface LinuxUnifiedPushProviderEndpointEvent {
  token: string;
  endpoint: string;
}

interface LinuxUnifiedPushProviderUnregisteredEvent {
  token: string;
}

const calendarIdsByProviderToken = new Map<string, string>();
const pushResourcesByProviderToken = new Map<string, string>();
const providerMessageHandlers = new Map<string, PushMessageHandler>();
const providerInvalidationHandlers = new Map<
  string,
  (calendarId: string, reason: string) => void
>();
let unlistenMessage: UnlistenFn | null = null;
let unlistenEndpoint: UnlistenFn | null = null;
let unlistenUnregistered: UnlistenFn | null = null;
let listenerPromise: Promise<void> | null = null;

const invalidateProviderSubscription = (token: string, reason: string) => {
  const calendarId = calendarIdsByProviderToken.get(token);
  if (!calendarId) return;

  const handler = providerInvalidationHandlers.get(calendarId);
  stopLinuxUnifiedPushProviderListening(calendarId);
  handler?.(calendarId, reason);
};

const ensureProviderEventListeners = () => {
  if (unlistenMessage || listenerPromise) return;

  const setupPromise = Promise.all([
    listen<LinuxUnifiedPushProviderMessageEvent>('unifiedpush://message', (event) => {
      const { token, message, messageBytes } = event.payload;
      const calendarId = calendarIdsByProviderToken.get(token);
      if (!calendarId) return;

      const handler = providerMessageHandlers.get(calendarId);
      if (!handler) return;

      handler(calendarId, message || `Linux UnifiedPush message (${messageBytes} bytes)`);
    }),
    listen<LinuxUnifiedPushProviderEndpointEvent>('unifiedpush://endpoint', (event) => {
      const { token, endpoint } = event.payload;
      const currentEndpoint = pushResourcesByProviderToken.get(token);
      if (!currentEndpoint || currentEndpoint === endpoint) return;

      invalidateProviderSubscription(token, 'Linux UnifiedPush endpoint changed');
    }),
    listen<LinuxUnifiedPushProviderUnregisteredEvent>('unifiedpush://unregistered', (event) => {
      invalidateProviderSubscription(event.payload.token, 'Linux UnifiedPush unregistered');
    }),
  ])
    .then(([message, endpoint, unregistered]) => {
      if (listenerPromise !== setupPromise) {
        message();
        endpoint();
        unregistered();
        return;
      }

      unlistenMessage = message;
      unlistenEndpoint = endpoint;
      unlistenUnregistered = unregistered;
    })
    .catch((error) => {
      listenerPromise = null;
      log.warn('Failed to listen for Linux UnifiedPush messages:', error);
    });

  listenerPromise = setupPromise;
};

export const isLinuxUnifiedPushProviderAvailable = async (): Promise<boolean> => {
  try {
    return await invoke<boolean>('linux_unifiedpush_available');
  } catch {
    return false;
  }
};

export const createLinuxUnifiedPushProviderSubscription = async (
  calendar: Calendar,
): Promise<PushEndpointSubscription | null> => {
  try {
    const token = generateUUID();
    const registration = await invoke<LinuxUnifiedPushProviderRegistration>(
      'linux_unifiedpush_register',
      {
        token,
        vapidPublicKey: calendar.pushVapidKey ?? null,
        description: `Chiri: ${calendar.displayName}`,
      },
    );
    const keyPair = await generateWebPushKeyPair();

    return {
      providerId: LINUX_UNIFIED_PUSH_PROVIDER_ID,
      providerToken: registration.token,
      pushResource: registration.endpoint,
      subscriptionPublicKey: keyPair.publicKey,
      authSecret: keyPair.authSecret,
      contentEncoding: 'aes128gcm',
    };
  } catch (error) {
    log.warn(`Failed to create Linux UnifiedPush subscription for ${calendar.displayName}:`, error);
    return null;
  }
};

export const restoreLinuxUnifiedPushProviderSubscription = async (
  subscription: PushSubscription,
  calendar: Calendar,
): Promise<boolean> => {
  if (!subscription.providerToken) return false;

  try {
    const registration = await invoke<LinuxUnifiedPushProviderRegistration>(
      'linux_unifiedpush_register',
      {
        token: subscription.providerToken,
        vapidPublicKey: calendar.pushVapidKey ?? null,
        description: `Chiri: ${calendar.displayName}`,
      },
    );

    if (registration.endpoint !== subscription.pushResource) {
      log.warn(
        `Linux UnifiedPush endpoint changed for ${calendar.displayName}; push subscription needs renewal`,
      );
      return false;
    }

    return true;
  } catch (error) {
    log.warn(
      `Failed to restore Linux UnifiedPush subscription for ${calendar.displayName}:`,
      error,
    );
    return false;
  }
};

export const startLinuxUnifiedPushProviderListening = (
  subscription: PushSubscription,
  onMessage: PushMessageHandler,
  onInvalidated?: (calendarId: string, reason: string) => void,
): boolean => {
  if (!subscription.providerToken) return false;

  calendarIdsByProviderToken.set(subscription.providerToken, subscription.calendarId);
  pushResourcesByProviderToken.set(subscription.providerToken, subscription.pushResource);
  providerMessageHandlers.set(subscription.calendarId, onMessage);
  if (onInvalidated) {
    providerInvalidationHandlers.set(subscription.calendarId, onInvalidated);
  } else {
    providerInvalidationHandlers.delete(subscription.calendarId);
  }
  ensureProviderEventListeners();
  return true;
};

export const stopLinuxUnifiedPushProviderListening = (calendarId: string): void => {
  providerMessageHandlers.delete(calendarId);
  providerInvalidationHandlers.delete(calendarId);

  for (const [token, activeCalendarId] of calendarIdsByProviderToken.entries()) {
    if (activeCalendarId === calendarId) {
      calendarIdsByProviderToken.delete(token);
      pushResourcesByProviderToken.delete(token);
    }
  }
};

export const removeLinuxUnifiedPushProviderSubscription = async (
  subscription: PushSubscription,
): Promise<void> => {
  stopLinuxUnifiedPushProviderListening(subscription.calendarId);

  if (!subscription.providerToken) return;

  try {
    await invoke('linux_unifiedpush_unregister', { token: subscription.providerToken });
  } catch (error) {
    log.warn('Failed to unregister Linux UnifiedPush subscription:', error);
  }
};

export const stopAllLinuxUnifiedPushProviderListeners = (): void => {
  calendarIdsByProviderToken.clear();
  pushResourcesByProviderToken.clear();
  providerMessageHandlers.clear();
  providerInvalidationHandlers.clear();
  unlistenMessage?.();
  unlistenEndpoint?.();
  unlistenUnregistered?.();
  unlistenMessage = null;
  unlistenEndpoint = null;
  unlistenUnregistered = null;
  listenerPromise = null;
};
