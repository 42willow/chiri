import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { usePlatform } from '$hooks/system/usePlatform';
import { isPushProviderAvailable } from '$lib/push';
import { createNtfyProviderConfig } from '$lib/push/ntfyProvider';
import {
  LINUX_UNIFIED_PUSH_PROVIDER_ID,
  NTFY_DIRECT_PROVIDER_ID,
  type PushProviderId,
} from '$types/push';
import { isLinuxPlatform } from '$utils/platform';

interface UsePushProviderAvailabilityOptions {
  enabled: boolean;
  pushProvider: PushProviderId;
  ntfyServerUrl: string;
}

export const usePushProviderConfig = (pushProvider: PushProviderId, ntfyServerUrl: string) => {
  const { pushProviderConfig } = usePushProviderConfigState(pushProvider, ntfyServerUrl);
  return pushProviderConfig;
};

export const usePushProviderConfigState = (pushProvider: PushProviderId, ntfyServerUrl: string) => {
  const { isKDE, isLoading } = usePlatform();
  const linuxUnifiedPushSelected = pushProvider === LINUX_UNIFIED_PUSH_PROVIDER_ID;
  const linuxUnifiedPushAllowed = isLinuxPlatform() && isKDE;
  const isResolvingLinuxUnifiedPush = linuxUnifiedPushSelected && isLinuxPlatform() && isLoading;
  const resolvedPushProvider =
    linuxUnifiedPushSelected && !isResolvingLinuxUnifiedPush && !linuxUnifiedPushAllowed
      ? NTFY_DIRECT_PROVIDER_ID
      : pushProvider;

  const pushProviderConfig = useMemo(
    () => ({
      providerId: resolvedPushProvider,
      ntfyConfig:
        resolvedPushProvider === NTFY_DIRECT_PROVIDER_ID
          ? createNtfyProviderConfig(ntfyServerUrl)
          : undefined,
    }),
    [resolvedPushProvider, ntfyServerUrl],
  );

  return {
    isResolvingLinuxUnifiedPush,
    linuxUnifiedPushAllowed,
    pushProviderConfig,
    resolvedPushProvider,
  };
};

export const usePushProviderAvailability = ({
  enabled,
  pushProvider,
  ntfyServerUrl,
}: UsePushProviderAvailabilityOptions) => {
  const {
    isResolvingLinuxUnifiedPush,
    linuxUnifiedPushAllowed,
    pushProviderConfig,
    resolvedPushProvider,
  } = usePushProviderConfigState(pushProvider, ntfyServerUrl);
  const availability = useQuery({
    queryKey: [
      'push-provider-availability',
      pushProviderConfig.providerId,
      pushProviderConfig.ntfyConfig?.serverUrl ?? '',
    ],
    queryFn: () => isPushProviderAvailable(pushProviderConfig),
    enabled: enabled && !isResolvingLinuxUnifiedPush,
    staleTime: 60_000,
  });

  return {
    availability,
    isResolvingLinuxUnifiedPush,
    linuxUnifiedPushAllowed,
    pushProviderConfig,
    resolvedPushProvider,
  };
};
