"use client";

export default function OwnerBillingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Could not load billing.</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
