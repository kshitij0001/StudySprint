import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useSettingsStore } from '@/store/useSettingsStore';

export function CountdownTimer() {
  const { targetDateISO } = useSettingsStore();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(targetDateISO);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDateISO]);

  return (
    <Card className="lg:col-span-2 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground p-6">
      <h2 className="text-lg font-semibold mb-4">NEET 2026 Countdown</h2>
      <div className="flex items-center justify-center space-x-4 text-center">
        <div className="bg-white/10 rounded-lg p-3 min-w-[80px]" data-testid="countdown-days">
          <div className="text-2xl font-bold">{timeLeft.days}</div>
          <div className="text-sm opacity-75">Days</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 min-w-[80px]" data-testid="countdown-hours">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-sm opacity-75">Hours</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 min-w-[80px]" data-testid="countdown-minutes">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-sm opacity-75">Minutes</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 min-w-[80px]" data-testid="countdown-seconds">
          <div className="text-2xl font-bold animate-pulse">{timeLeft.seconds}</div>
          <div className="text-sm opacity-75">Seconds</div>
        </div>
      </div>
    </Card>
  );
}
