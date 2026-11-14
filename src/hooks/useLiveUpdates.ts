import { useEffect, useRef } from 'react';

const LIVE_UPDATE_INTERVAL_MS = 1000;

export function useLiveUpdates(onUpdate: () => void | Promise<void>) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    let active = true;
    let checking = false;
    let lastVersion: number | null = null;

    async function checkForUpdates() {
      if (!active || checking || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const response = await fetch('/api/updates/version', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('The live update service could not be reached.');
        }
        const data = await response.json();
        if (typeof data.version !== 'number' || !Number.isSafeInteger(data.version)) {
          throw new Error('The live update service returned an invalid version.');
        }
        if (!active) return;

        if (lastVersion !== null && data.version !== lastVersion) {
          lastVersion = data.version;
          await onUpdateRef.current();
        } else {
          lastVersion = data.version;
        }
      } catch (error) {
        console.error('Live update check failed:', error);
      } finally {
        checking = false;
      }
    }

    const intervalId = window.setInterval(() => {
      void checkForUpdates();
    }, LIVE_UPDATE_INTERVAL_MS);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void checkForUpdates();
    };

    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshWhenVisible);
    void checkForUpdates();

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, []);
}
