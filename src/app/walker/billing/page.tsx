import { getWalkerBillingAction } from "./actions";

export default async function WalkerBillingPage() {
  const { periods } = await getWalkerBillingAction();
  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Billing</h1>
      {periods.length === 0 && <p className="text-muted-foreground">No payment periods yet.</p>}
      {periods.map((period) => (
        <div key={period.id} className="border rounded p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">{period.status}</span>
            <span className="font-semibold">{period.totalAmount} ILS</span>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {period.entries.map((e) => (
              <li key={e.id}>{e.entryType} — {e.amount} ILS</li>
            ))}
            {period.entries.length === 0 && <li>No walks yet.</li>}
          </ul>
        </div>
      ))}
    </main>
  );
}
