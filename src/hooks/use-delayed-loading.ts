import { useEffect, useState } from "react";

export function useDelayedLoading(isLoading: boolean, delay: number = 200): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return showSkeleton;
}
