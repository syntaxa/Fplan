import React from 'react';
import type { CalculationResult } from '../../types';
import { SummarySection } from './SummarySection';
import { CyclesDetailTable } from './CyclesDetailTable';

interface ResultsReportProps {
  result: CalculationResult | null;
}

export function ResultsReport({ result }: ResultsReportProps) {
  if (!result) {
    return null;
  }

  return (
    <div>
      <SummarySection result={result} />
      <CyclesDetailTable cycles={result.cycles} />
    </div>
  );
}
