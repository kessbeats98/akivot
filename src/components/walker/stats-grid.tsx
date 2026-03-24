import { Clock, Users } from "lucide-react";

type StatsGridProps = {
  dogCount: number;
};

export function StatsGrid({ dogCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-12">
      {/* Next walk */}
      <div className="bg-white rounded-xl p-6 border border-[#2A9D8F]/5 flex flex-col gap-2">
        <Clock size={20} className="text-[#2A9D8F]" />
        <p className="text-xs text-neutral-500">הטיול הבא</p>
        <p className="text-2xl font-bold text-neutral-800">--</p>
      </div>

      {/* Registered dogs */}
      <div className="bg-white rounded-xl p-6 border border-[#2A9D8F]/5 flex flex-col gap-2">
        <Users size={20} className="text-[#2A9D8F]" />
        <p className="text-xs text-neutral-500">כלבים רשומים</p>
        <p className="text-2xl font-bold text-neutral-800">{dogCount}</p>
      </div>
    </div>
  );
}
