import React, { useState, useEffect, FC } from "react";
import type { ReactNode } from 'react';

interface CountUpAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

const CountUpAnimation: FC<CountUpAnimationProps> = ({
  end,
  duration = 2.5,
  suffix = "",
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | undefined;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = end * easeOutQuart;

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    return decimals > 0
      ? num.toFixed(decimals)
      : Math.floor(num).toLocaleString();
  };

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

export default CountUpAnimation;
