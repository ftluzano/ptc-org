import { useEffect, useRef } from 'react';
import {
  PORTAL_UPDATE_CHANNEL,
  PORTAL_UPDATE_CLIENT_ID,
  PORTAL_UPDATE_EVENT,
} from '../lib/portalUpdates';

export function useLiveUpdates(onUpdate: () => void | Promise<void>) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    let active = true;
    let refreshing = false;

    function refresh() {
      if (!active || refreshing || document.visibilityState === 'hidden') return;
      refreshing = true;
      Promise.resolve(onUpdateRef.current())
        .catch((error: unknown) => console.error('Live update refresh failed:', error))
        .finally(() => {
          refreshing = false;
        });
    }

    function refreshFromChannel(event: MessageEvent<{ source?: string }>) {
      if (event.data?.source !== PORTAL_UPDATE_CLIENT_ID) refresh();
    }

    const channel =
      typeof BroadcastChannel === 'undefined'
        ? null
        : new BroadcastChannel(PORTAL_UPDATE_CHANNEL);

    window.addEventListener(PORTAL_UPDATE_EVENT, refresh);
    channel?.addEventListener('message', refreshFromChannel);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      active = false;
      channel?.close();
      window.removeEventListener(PORTAL_UPDATE_EVENT, refresh);
      channel?.removeEventListener('message', refreshFromChannel);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
}
