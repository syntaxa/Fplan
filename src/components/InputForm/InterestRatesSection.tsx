import React from 'react';
import { RateChart } from '../RateChart/RateChart';
import type { RatePeriod } from '../../types';

interface InterestRatesSectionProps {
  ratePeriods: RatePeriod[];
  targetDate: Date;
  onRatePeriodsChange: (periods: RatePeriod[]) => void;
  onResetRatePeriods?: () => void;
  error?: string;
}

export function InterestRatesSection({
  ratePeriods,
  targetDate,
  onRatePeriodsChange,
  onResetRatePeriods,
  error,
}: InterestRatesSectionProps) {
  const hasMultiplePeriods = ratePeriods.length > 1;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Процентные ставки
        </h2>
        {hasMultiplePeriods && onResetRatePeriods && (
          <button
            onClick={onResetRatePeriods}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            title="Сбросить все изменения и вернуться к одному периоду"
          >
            Сбросить процентные ставки
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <RateChart
        ratePeriods={ratePeriods}
        targetDate={targetDate}
        onRatePeriodsChange={onRatePeriodsChange}
      />
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Периоды процентных ставок:
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          {ratePeriods.map((period) => (
            <li key={period.id}>
              {period.startMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} – 
              {' '}
              {period.endMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}: 
              {' '}
              <span className="font-semibold">{period.annualRate}%</span>
            </li>
          ))}
        </ul>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        💡 Подсказка: Кликните на дату окончания вклада, чтобы 
        изменить ставку для следующих периодов. Тяните 
        периоды вверх/вниз для изменения ставки.
      </p>
    </div>
  );
}
