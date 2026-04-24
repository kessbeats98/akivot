'use server';
import { WalkerDashboardData } from '@/lib/services/walks/types';

export async function getWalkerDashboardAction(): Promise<WalkerDashboardData> {
  return { assignedDogs: [], activeWalks: [] };
}
export async function startWalkAction(dogId: string) {}
export async function endWalkAction(walkId: string, finalPrice?: string, note?: string) {}
