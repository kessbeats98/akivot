import { getOwnerDogsAction } from "@/app/owner/dashboard/actions";
import { OwnerDogsClient } from "./OwnerDogsClient";

export default async function OwnerDogsPage() {
  const dogs = await getOwnerDogsAction();
  return <OwnerDogsClient dogs={dogs} />;
}
