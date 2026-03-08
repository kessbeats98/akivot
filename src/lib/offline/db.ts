// TODO TASK-08: full implementation
// Defined now so the table shape is stable before service worker work begins.
export interface PendingMedia {
  id: string;
  walkId: string;
  blob: Blob;
  createdAt: Date;
}
// AkivotOfflineDB class — TODO TASK-08: extend Dexie, register version 1 store
