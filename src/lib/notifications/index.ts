import { invoke } from '@tauri-apps/api/core';
import type {
  NotificationPermissionResult,
  NotificationPermissionStatus,
  NotificationPermissionStatusResult,
  SendNotificationOptions,
  SimpleNotificationOptions,
} from '$types/notification';

// Cache for permission status to avoid re-checking on every component mount
let cachedPermissionStatus: NotificationPermissionStatus | null = null;

/**
 * Get the cached notification permission status without making an async call.
 * Returns null if the status hasn't been checked yet.
 */
export const getCachedNotificationPermission = () => {
  return cachedPermissionStatus;
};

/**
 * Check the current notification permission status.
 * On macOS, this uses the native UNUserNotificationCenter API to get the real permission state.
 * On other platforms, returns 'granted' by default.
 */
export const checkNotificationPermission = async () => {
  const result = await invoke<NotificationPermissionStatusResult>('check_notification_permission');
  cachedPermissionStatus = result.status;
  return result;
};

/**
 * Request notification permission from the user.
 * On macOS, this displays the native system permission dialog.
 * On other platforms, returns granted immediately.
 */
export const requestNotificationPermission = async () => {
  const result = await invoke<NotificationPermissionResult>('request_notification_permission');
  cachedPermissionStatus = result.status;
  return result;
};

/**
 * Send a notification with actions using the native macOS API.
 * This uses user-notify to send notifications with action buttons.
 */
export const sendNotification = async (options: SendNotificationOptions) => {
  await invoke('send_notification_with_actions', { request: options });
};

/**
 * Send a simple notification without actions or task metadata.
 * Used for system notifications like quit confirmation.
 */
export const sendSimpleNotification = async (options: SimpleNotificationOptions) => {
  await invoke('send_simple_notification', { request: options });
};
