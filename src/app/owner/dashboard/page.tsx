import { getOwnerDogsAction, createDogAction, deactivateDogAction } from "./actions";

export default async function OwnerDashboardPage() {
  const dogs = await getOwnerDogsAction();

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">My Dogs</h1>

      <ul className="space-y-3">
        {dogs.map((dog) => (
          <li key={dog.id} className="border rounded p-4 flex justify-between items-start">
            <div>
              <p className="font-medium">{dog.name}</p>
              {dog.breed && <p className="text-sm text-muted-foreground">{dog.breed}</p>}
              {dog.walkers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Walker: {dog.walkers.map((w) => w.displayName).join(", ")}
                </p>
              )}
            </div>
            <form action={deactivateDogAction.bind(null, dog.id)}>
              <button type="submit" className="text-sm text-destructive hover:underline">
                Deactivate
              </button>
            </form>
          </li>
        ))}
        {dogs.length === 0 && <p className="text-muted-foreground">No dogs yet.</p>}
      </ul>

      <section>
        <h2 className="text-lg font-medium mb-2">Add a dog</h2>
        <form action={createDogAction} className="space-y-2">
          <input name="name" placeholder="Name *" required className="border rounded px-3 py-2 w-full" />
          <input name="breed" placeholder="Breed" className="border rounded px-3 py-2 w-full" />
          <input type="date" name="birthDate" className="border rounded px-3 py-2 w-full" />
          <input name="notes" placeholder="Notes" className="border rounded px-3 py-2 w-full" />
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded">
            Add
          </button>
        </form>
      </section>
    </main>
  );
}
