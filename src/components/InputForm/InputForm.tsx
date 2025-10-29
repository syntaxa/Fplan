import React from 'react';
import { BasicParametersSection } from './BasicParametersSection';
import { InterestRatesSection } from './InterestRatesSection';
import type { RatePeriod } from '../../types';
import { getCurrentMonthStart, addMonthsToDate } from '../../utils/dateUtils';

interface InputFormProps {
  initialAmount: number;
  targetDate: Date;
  monthlyContribution: number;
  ratePeriods: RatePeriod[];
  onInitialAmountChange: (value: number) => void;
  onTargetDateChange: (value: Date) => void;
  onMonthlyContributionChange: (value: number) => void;
  onRatePeriodsChange: (periods: RatePeriod[]) => void;
  onResetRatePeriods?: () => void;
  errors?: {
    initialAmount?: string;
    targetDate?: string;
    monthlyContribution?: string;
    ratePeriods?: string;
  };
}

export function InputForm({
  initialAmount,
  targetDate,
  monthlyContribution,
  ratePeriods,
  onInitialAmountChange,
  onTargetDateChange,
  onMonthlyContributionChange,
  onRatePeriodsChange,
  onResetRatePeriods,
  errors,
}: InputFormProps) {
  return (
    <div>
      <BasicParametersSection
        initialAmount={initialAmount}
        targetDate={targetDate}
        monthlyContribution={monthlyContribution}
        onInitialAmountChange={onInitialAmountChange}
        onTargetDateChange={onTargetDateChange}
        onMonthlyContributionChange={onMonthlyContributionChange}
        errors={errors}
      />
      
      <InterestRatesSection
        ratePeriods={ratePeriods}
        targetDate={targetDate}
        onRatePeriodsChange={onRatePeriodsChange}
        onResetRatePeriods={onResetRatePeriods}
        error={errors?.ratePeriods}
      />
    </div>
  );
}
