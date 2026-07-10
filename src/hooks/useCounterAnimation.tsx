import { useEffect, useRef, useState } from "react";

interface UseCounterAnimationProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export const useCounterAnimation = ({
  end,
  duration = 2000,
  decimals = 0,
  prefix = "",
  suffix = "",
}: UseCounterAnimationProps) => {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsInView(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = startValue + (end - startValue) * easeOutQuart;

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  const displayValue = `${prefix}${count.toFixed(decimals)}${suffix}`;

  return { ref, displayValue, count };
};

// Helper function to parse number strings like "500+", "81%", "₹4.83L"
export const parseNumberString = (value: string): {
  number: number;
  prefix: string;
  suffix: string;
  decimals: number;
} => {
  // Remove commas
  const cleaned = value.replace(/,/g, "");
  
  // Extract prefix (currency symbols, etc.)
  const prefixMatch = cleaned.match(/^[^\d.]+/);
  const prefix = prefixMatch ? prefixMatch[0] : "";
  
  // Extract suffix (%, +, L, K, etc.)
  const suffixMatch = cleaned.match(/[^\d.]+$/);
  const suffix = suffixMatch ? suffixMatch[0] : "";
  
  // Extract number
  const numberStr = cleaned.replace(prefix, "").replace(suffix, "");
  let number = parseFloat(numberStr);
  
  // Handle L (Lakhs) and K (Thousands)
  if (suffix.includes("L")) {
    number = number; // Keep as is, we'll show decimals
  } else if (suffix.includes("K")) {
    number = number;
  }
  
  // Determine decimals
  const decimals = numberStr.includes(".") ? numberStr.split(".")[1].length : 0;
  
  return { number, prefix, suffix, decimals };
};
