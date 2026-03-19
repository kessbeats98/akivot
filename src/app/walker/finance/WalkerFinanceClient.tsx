"use client";

import { useState, useTransition } from "react";
import { Wallet, TrendingUp, ChevronDown, ChevronUp, Check, Undo2 } from "lucide-react";
import { TopBar } from "@/components/shared/TopBar";
import { BottomNav } from "@/components/shared/BottomNav";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { WalkerFinanceData, OwnerBalance, RecentPeriod, PeriodEntry } from "./actions";
import { closePeriodAction, reopenPeriodAction } from "./actions";

type Props = {
  data: WalkerFinanceData;
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
}

export function WalkerFinanceClient({ data }: Props) {
  const [expandedPeriodId, setExpandedPeriodId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleClosePeriod(periodId: string, lockVersion: number) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await closePeriodAction(periodId, lockVersion);
      if (result.success) {
        setSuccess("התקופה נסגרה בהצלחה");
      } else {
        setError(result.error ?? "שגיאה בסגירת התקופה");
      }
    });
  }

  function handleReopenPeriod(periodId: string, lockVersion: number) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await reopenPeriodAction(periodId, lockVersion);
      if (result.success) {
        setSuccess("התקופה נפתחה מחדש");
      } else {
        setError(result.error ?? "שגיאה בפתיחת התקופה");
      }
    });
  }

  function togglePeriod(periodId: string) {
    setExpandedPeriodId(expandedPeriodId === periodId ? null : periodId);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <TopBar name={data.userName} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Feedback Banners */}
        {error && (
          <ErrorBanner message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-light border border-primary/20 rounded-lg">
            <Check className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="flex-1 text-sm text-primary font-medium">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="p-1 rounded-full hover:bg-primary/10 transition-colors"
              aria-label="סגור הודעה"
            >
              <ChevronUp className="w-4 h-4 text-primary" />
            </button>
          </div>
        )}

        {/* Summary Card */}
        <section className="bg-card rounded-2xl p-5 border border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">סיכום כספי</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center">
                <Wallet className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground font-mono">
                  {data.openBalancesTotal.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">{"₪"} יתרות פתוחות</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground font-mono">
                  {data.paidThisMonth.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">{"₪"} שולם החודש</p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Balances by Owner */}
        <section className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">יתרות לפי בעלים</h2>
          
          {data.balancesByOwner.length === 0 ? (
            <div className="py-8 text-center">
              <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">אין יתרות פתוחות</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.balancesByOwner.map((balance) => (
                <OwnerBalanceCard
                  key={balance.periodId}
                  balance={balance}
                  onClose={() => handleClosePeriod(balance.periodId, balance.lockVersion)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Periods */}
        <section className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">תקופות אחרונות</h2>
          
          {data.recentPeriods.length === 0 ? (
            <div className="py-8 text-center">
              <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">אין תקופות סגורות</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentPeriods.map((period) => (
                <PeriodAccordion
                  key={period.id}
                  period={period}
                  isExpanded={expandedPeriodId === period.id}
                  onToggle={() => togglePeriod(period.id)}
                  onReopen={(lockVersion) => handleReopenPeriod(period.id, lockVersion)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav variant="walker" active="finance" />
    </div>
  );
}

function OwnerBalanceCard({
  balance,
  onClose,
  isPending,
}: {
  balance: OwnerBalance;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
      <div>
        <p className="font-medium text-foreground">{balance.ownerName}</p>
        <p className="text-xs text-muted-foreground">{balance.walkCount} טיולים</p>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="font-mono font-semibold text-lg text-accent">
          {parseFloat(balance.totalAmount).toFixed(0)} {"₪"}
        </span>
        <button
          onClick={onClose}
          disabled={isPending}
          className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          סגור תקופה
        </button>
      </div>
    </div>
  );
}

function PeriodAccordion({
  period,
  isExpanded,
  onToggle,
  onReopen,
  isPending,
}: {
  period: RecentPeriod;
  isExpanded: boolean;
  onToggle: () => void;
  onReopen: (lockVersion: number) => void;
  isPending: boolean;
}) {
  return (
    <div className="bg-background rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-foreground">{period.ownerName}</p>
            <p className="text-xs text-muted-foreground">{period.monthLabel}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-primary">
            {parseFloat(period.totalAmount).toFixed(0)} {"₪"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {period.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              אין רשומות בתקופה זו
            </p>
          ) : (
            <div className="space-y-2">
              {period.entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
          
          <button
            onClick={() => onReopen(0)} // lockVersion will be fetched from server
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            פתח תקופה מחדש
          </button>
        </div>
      )}
    </div>
  );
}

function EntryRow({ entry }: { entry: PeriodEntry }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-card rounded-lg border border-border/50">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {formatDate(entry.date)}
        </span>
        {entry.dogName && (
          <span className="text-sm font-medium text-foreground">
            {entry.dogName}
          </span>
        )}
      </div>
      <span className="font-mono text-sm text-foreground">
        {parseFloat(entry.amount).toFixed(0)} {"₪"}
      </span>
    </div>
  );
}
