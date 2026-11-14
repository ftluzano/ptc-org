export const PORTAL_UPDATE_EVENT = 'ptc:portal-data-updated';
export const PORTAL_UPDATE_CHANNEL = 'ptc-portal-data-updates';
export const PORTAL_UPDATE_CLIENT_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

let updateChannel: BroadcastChannel | null = null;

export function notifyPortalDataChanged() {
  window.dispatchEvent(new Event(PORTAL_UPDATE_EVENT));

  if (typeof BroadcastChannel !== 'undefined') {
    updateChannel ??= new BroadcastChannel(PORTAL_UPDATE_CHANNEL);
    updateChannel.postMessage({ source: PORTAL_UPDATE_CLIENT_ID });
  }
}
