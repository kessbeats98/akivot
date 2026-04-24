'use server';
import { AssignedDog } from '@/lib/services/walks/types';

export async function getOwnerDogsAction() {
  return [];
}
export async function createDogAction(name: string, breed?: string, birthDate?: string, notes?: string) {}
export async function deactivateDogAction(dogId: string) {}
export async function assignWalkerAction(dogId: string, walkerProfileId: string) {}
export async function setPriceAction(dogWalkerId: string, priceString: string) {}
export async function getAvailableWalkersAction() { return []; }
