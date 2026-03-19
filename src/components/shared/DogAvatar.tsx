import Image from "next/image";

type DogAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
};

const imageSizes = {
  sm: 32,
  md: 48,
  lg: 64,
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return name.slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function DogAvatar({ name, imageUrl, size = "md" }: DogAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full bg-primary-light flex items-center justify-center
        overflow-hidden flex-shrink-0
      `}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold text-primary">{initials}</span>
      )}
    </div>
  );
}
