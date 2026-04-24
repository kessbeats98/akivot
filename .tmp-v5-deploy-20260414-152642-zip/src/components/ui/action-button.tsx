import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "accent";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export function ActionButton({
  label,
  icon: Icon,
  variant = "primary",
  onClick,
  type = "button",
}: ActionButtonProps) {
  const bg = variant === "primary" ? "bg-[#2A9D8F]" : "bg-[#F4A261]";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full h-14 rounded-2xl text-lg font-semibold text-white flex gap-2 items-center justify-center ${bg} active:opacity-90 transition-opacity`}
    >
      {Icon && <Icon size={22} />}
      {label}
    </button>
  );
}
