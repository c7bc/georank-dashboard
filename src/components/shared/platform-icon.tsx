import { platformImagePaths, platformLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

export function PlatformIcon({ platform, size = 16, className }: PlatformIconProps) {
  const src = platformImagePaths[platform];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={platformLabels[platform] || platform}
      width={size}
      height={size}
      className={cn("rounded-sm object-contain shrink-0 dark:invert", className)}
    />
  );
}
