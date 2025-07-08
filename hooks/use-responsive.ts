import { useEffect, useState } from "react";

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on client-side
    if (typeof window !== "undefined") {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkIsMobile();

      // Add event listener for resize
      window.addEventListener("resize", checkIsMobile);

      // Cleanup
      return () => window.removeEventListener("resize", checkIsMobile);
    }
  }, []);

  return { isMobile };
}
