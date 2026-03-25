export function OwnerPaymentsEmptyState() {
  return (
    <section className="px-6">
      <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200">
        <span className="material-symbols-rounded text-6xl text-brand/30 block mb-4">
          account_balance_wallet
        </span>
        <p className="text-dark font-black text-xl mb-1">עדיין אין פעילות כספית</p>
        <p className="text-gray-400 font-medium text-sm">היסטוריית התשלומים תופיע כאן</p>
      </div>
    </section>
  );
}
