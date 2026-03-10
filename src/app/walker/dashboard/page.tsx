import { getWalkerDashboardAction, startWalkAction, endWalkAction } from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";

export default async function WalkerDashboardPage() {
  const { assignedDogs, activeWalks } = await getWalkerDashboardAction();

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Walker Dashboard</h1>
        <EnableNotificationsButton />
      </div>

      <section>
        <h2 className="text-lg font-medium mb-2">Active Walks</h2>
        {activeWalks.length === 0 ? (
          <p className="text-muted-foreground">No active walks.</p>
        ) : (
          <ul className="space-y-3">
            {activeWalks.map((walk) => (
              <li key={walk.id} className="border rounded p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium">{walk.dogName}</p>
                  {walk.dogBreed && (
                    <p className="text-sm text-muted-foreground">{walk.dogBreed}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Started: {walk.startTime.toLocaleTimeString()}
                  </p>
                </div>
                <form action={endWalkAction.bind(null, walk.id)}>
                  <button type="submit" className="text-sm text-destructive hover:underline">
                    End Walk
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">My Dogs</h2>
        {assignedDogs.length === 0 ? (
          <p className="text-muted-foreground">No dogs assigned.</p>
        ) : (
          <ul className="space-y-3">
            {assignedDogs.map((dog) => (
              <li key={dog.dogWalkerId} className="border rounded p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium">{dog.dogName}</p>
                  {dog.dogBreed && (
                    <p className="text-sm text-muted-foreground">{dog.dogBreed}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {dog.currentPrice} {dog.currency}
                  </p>
                </div>
                <form action={startWalkAction.bind(null, dog.dogId)}>
                  <button type="submit" className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded">
                    Start Walk
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
