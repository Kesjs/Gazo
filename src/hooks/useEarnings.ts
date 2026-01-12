// src/hooks/useEarnings.ts
import { useState, useEffect } from 'react';
import { runDailyEarningsProcess } from '@/lib/services/earningsService';

export function useEarnings() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeEarningsCalculation = async () => {
    setIsRunning(true);
    setError(null);

    try {
      await runDailyEarningsProcess();
      setLastRun(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsRunning(false);
    }
  };

  return {
    executeEarningsCalculation,
    isRunning,
    lastRun,
    error
  };
}
