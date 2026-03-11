import { offlineDb, type PendingMedia } from "./db";

export async function enqueueMedia(
  walkId: string,
  blob: Blob,
  capturedAt: Date,
): Promise<number> {
  return offlineDb.pendingMedia.add({ walkId, blob, capturedAt });
}

export async function getPendingMedia(): Promise<PendingMedia[]> {
  return offlineDb.pendingMedia.toArray();
}

export async function dequeueMedia(id: number): Promise<void> {
  await offlineDb.pendingMedia.delete(id);
}
