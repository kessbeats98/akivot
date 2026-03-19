"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, Dog } from "lucide-react";
import { TopBar } from "@/components/shared/TopBar";
import { BottomNav } from "@/components/shared/BottomNav";
import { DogAvatar } from "@/components/shared/DogAvatar";
import type { WalkerDogsData, WalkerDog } from "./actions";

type Props = {
  data: WalkerDogsData;
};

type FilterType = "all" | "anxious" | "energetic" | "new";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "anxious", label: "כלבים חרדתיים" },
  { key: "energetic", label: "כלבים אנרגטיים" },
  { key: "new", label: "לקוחות חדשים" },
];

export function WalkerDogsClient({ data }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredDogs = useMemo(() => {
    let result = data.dogs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (dog) =>
          dog.name.toLowerCase().includes(query) ||
          dog.ownerName.toLowerCase().includes(query) ||
          (dog.breed && dog.breed.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case "anxious":
        result = result.filter((dog) => dog.tags.includes("חרדתי"));
        break;
      case "energetic":
        result = result.filter((dog) => dog.tags.includes("אנרגטי"));
        break;
      case "new":
        result = result.filter((dog) => dog.isNew);
        break;
    }

    return result;
  }, [data.dogs, searchQuery, activeFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <TopBar name={data.userName} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="חיפוש כלב או בעלים"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeFilter === filter.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Dogs List */}
        {filteredDogs.length === 0 ? (
          <EmptyState
            hasSearch={searchQuery.trim() !== "" || activeFilter !== "all"}
          />
        ) : (
          <div className="space-y-3">
            {filteredDogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        )}
      </main>

      <BottomNav variant="walker" active="dogs" />
    </div>
  );
}

function DogCard({ dog }: { dog: WalkerDog }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
      <DogAvatar
        name={dog.name}
        imageUrl={dog.imageUrl ?? undefined}
        size="lg"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{dog.name}</h3>
          {dog.isNew && (
            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full">
              חדש
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground truncate">
          {dog.breed && `${dog.breed} · `}{dog.ownerName}
        </p>

        {dog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dog.tags.map((tag) => (
              <span
                key={tag}
                className={`
                  px-2 py-0.5 text-[10px] font-medium rounded-full
                  ${tag === "חרדתי" || tag === "ריאקטיבי"
                    ? "bg-yellow-100 text-yellow-800"
                    : tag === "אנרגטי"
                    ? "bg-green-100 text-green-800"
                    : tag === "גור"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ChevronLeft className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Dog className="w-10 h-10 text-muted-foreground" />
      </div>
      {hasSearch ? (
        <>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            לא נמצאו תוצאות
          </h3>
          <p className="text-muted-foreground text-sm">
            נסה לחפש במילות מפתח אחרות
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            אין עדיין כלבים משויכים
          </h3>
          <p className="text-muted-foreground text-sm">
            כשבעלי כלבים יוסיפו אותך כמטייל, הכלבים יופיעו כאן
          </p>
        </>
      )}
    </div>
  );
}
