import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { BRUTAL_MOTIVATIONS } from '@/lib/constants';

export function MicroMotivation() {
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    // Select motivation based on day of year for consistency
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % BRUTAL_MOTIVATIONS.length;
    setMotivation(BRUTAL_MOTIVATIONS[index]);
  }, []);

  return (
    <Card className="p-6 border-border">
      <div className="text-center">
        <div className="text-2xl mb-2"></div>
        <p className="text-sm text-muted-foreground font-medium" data-testid="text-motivation">
          {motivation}
        </p>
      </div>
    </Card>
  );
}
