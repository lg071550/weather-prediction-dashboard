import type { EnsembleForecast, NwpModelForecast, Signal } from '../types/weather';

/**
 * Compute ensemble stats per date from available NWP model tmax values.
 */
export function computeEnsemble(
  models: NwpModelForecast[]
): EnsembleForecast[] {
  // Collect all unique dates
  const dateSet = new Set<string>();
  for (const m of models) {
    for (const d of m.dailyForecasts) {
      dateSet.add(d.date);
    }
  }
  const dates = Array.from(dateSet).sort();

  const perDate = dates.map((date) => {
    const tmaxValues: number[] = [];
    for (const m of models) {
      const day = m.dailyForecasts.find((d) => d.date === date);
      if (day?.tmaxC != null) {
        tmaxValues.push(day.tmaxC);
      }
    }

    if (tmaxValues.length === 0) {
      return {
        date,
        weightedTmax: null,
        spread: 0,
        sigma: 0,
        modelsAgree: true,
        modelCount: 0,
        deltaFromPrevious: null,
        changedSincePrevious: false,
      };
    }

    const mean = tmaxValues.reduce((a, b) => a + b, 0) / tmaxValues.length;
    const min = Math.min(...tmaxValues);
    const max = Math.max(...tmaxValues);
    const spread = max - min;

    // Population standard deviation
    let sigma = 0;
    if (tmaxValues.length > 1) {
      const variance =
        tmaxValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
        tmaxValues.length;
      sigma = Math.sqrt(variance) * 2.5;
    }

    const modelsAgree = spread < 1.5;

    return {
      date,
      weightedTmax: round2(mean),
      spread: round2(spread),
      sigma: round2(sigma),
      modelsAgree,
      modelCount: tmaxValues.length,
      deltaFromPrevious: null,
      changedSincePrevious: false,
    };
  });

  return perDate.map((entry, index) => {
    if (index === 0) {
      return entry;
    }

    const previous = perDate[index - 1];
    if (entry.weightedTmax == null || previous.weightedTmax == null) {
      return entry;
    }

    const deltaFromPrevious = round2(entry.weightedTmax - previous.weightedTmax);
    return {
      ...entry,
      deltaFromPrevious,
      changedSincePrevious: Math.abs(deltaFromPrevious) >= 0.1,
    };
  });
}

/**
 * Determine signal for primary station.
 */
export function computeSignal(
  observedHighC: number | null,
  todayWeightedTmax: number | null
): Signal | null {
  if (observedHighC == null || todayWeightedTmax == null) return null;
  if (observedHighC > todayWeightedTmax) return 'Warmer than expected';
  if (Math.abs(observedHighC - todayWeightedTmax) <= 0.5) return 'As expected';
  return 'Cooler than expected';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
