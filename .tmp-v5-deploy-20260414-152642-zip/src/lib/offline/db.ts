import Dexie, { type Table } from "dexie";

export const OFFLINE_DB_NAME = "AkivotOfflineDB";
export const PENDING_MEDIA_STORE = "pendingMedia";

export interface PendingMedia {
  id?: number;
  walkId: string;
  blob: Blob;
  capturedAt: Date;
}

class AkivotOfflineDB extends Dexie {
  [PENDING_MEDIA_STORE]!: Table<PendingMedia, number>;

  constructor() {
    super(OFFLINE_DB_NAME);
    this.version(1).stores({
      [PENDING_MEDIA_STORE]: "++id, walkId, capturedAt",
    });
  }
}

export const offlineDb = new AkivotOfflineDB();
