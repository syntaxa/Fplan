import React, { useState, useCallback, useMemo } from 'react';
import { InputForm } from './components/InputForm/InputForm';
import { ResultsReport } from './components/ResultsReport/ResultsReport';
import { calculateSavings } from './utils/calculator';
import type { RatePeriod, CalculationResult } from './types';
import {
  getCurrentMonthStart,
  addMonthsToDate,
  monthsBetween,
  normalizeToMonthStart,
} from './utils/dateUtils';

function App() {
  const [initialAmount, setInitialAmount] = useState<number>(100000);
  const [targetDate, setTargetDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 12); // По умолчанию через год
    return date;
  });
  const [monthlyContribution, setMonthlyContribution] = useState<number>(10000);
  
  // Инициализация периодов ставок - один период на весь срок
  const [ratePeriods, setRatePeriods] = useState<RatePeriod[]>(() => {
    const start = getCurrentMonthStart();
    const end = normalizeToMonthStart(targetDate);
    return [{
      id: 'initial-period',
      startMonth: start,
      endMonth: end,
      annualRate: 15.0,
    }];
  });

  const [errors, setErrors] = useState<{
    initialAmount?: string;
    targetDate?: string;
    monthlyContribution?: string;
    ratePeriods?: string;
  }>({});

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Валидация данных
  const validateInputs = useCallback((): boolean => {
    const newErrors: typeof errors = {};

    if (initialAmount <= 0) {
      newErrors.initialAmount = 'Начальная сумма должна быть больше нуля';
    }

    const minTargetDate = addMonthsToDate(getCurrentMonthStart(), 1);
    if (normalizeToMonthStart(targetDate) <= getCurrentMonthStart()) {
      newErrors.targetDate = 'Целевая дата должна быть в будущем';
    }

    if (monthlyContribution < 0) {
      newErrors.monthlyContribution = 'Ежемесячный взнос не может быть отрицательным';
    }

    // Проверка покрытия всех дат ставками
    const start = getCurrentMonthStart();
    const end = normalizeToMonthStart(targetDate);
    const totalMonths = monthsBetween(start, end);
    
    // Сортируем периоды по дате начала
    const sortedPeriods = [...ratePeriods].sort((a, b) =>
      normalizeToMonthStart(a.startMonth).getTime() - normalizeToMonthStart(b.startMonth).getTime()
    );

    // Проверяем, что периоды покрывают весь срок
    let currentDate = new Date(start);
    for (const period of sortedPeriods) {
      const periodStart = normalizeToMonthStart(period.startMonth);
      const periodEnd = normalizeToMonthStart(period.endMonth);
      
      if (currentDate < periodStart) {
        newErrors.ratePeriods = `Есть пробел в периодах ставок (между ${currentDate.toLocaleDateString('ru-RU')} и ${periodStart.toLocaleDateString('ru-RU')})`;
        break;
      }
      
      if (currentDate <= periodEnd) {
        currentDate = addMonthsToDate(periodEnd, 1);
      }
    }
    
    if (currentDate <= end) {
      newErrors.ratePeriods = 'Периоды ставок не покрывают весь срок до целевой даты';
    }

    // Проверка диапазонов ставок
    for (const period of ratePeriods) {
      if (period.annualRate < 1 || period.annualRate > 30) {
        newErrors.ratePeriods = 'Ставка должна быть в диапазоне от 1% до 30%';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [initialAmount, targetDate, monthlyContribution, ratePeriods]);

  // Функция сброса процентных ставок
  const resetRatePeriods = useCallback(() => {
    const start = getCurrentMonthStart();
    const end = normalizeToMonthStart(targetDate);
    // Используем среднюю ставку из всех периодов, если есть, иначе 15%
    let defaultRate = 15.0;
    if (ratePeriods.length > 0) {
      const totalRate = ratePeriods.reduce((sum, p) => sum + p.annualRate, 0);
      defaultRate = totalRate / ratePeriods.length;
    }
    setRatePeriods([{
      id: `period-${Date.now()}`,
      startMonth: start,
      endMonth: end,
      annualRate: Math.round(defaultRate * 4) / 4, // Округляем до 0.25%
    }]);
  }, [targetDate, ratePeriods]);

  // Обновление периодов ставок при изменении целевой даты
  React.useEffect(() => {
    const newEndDate = normalizeToMonthStart(targetDate);
    setRatePeriods((prevPeriods) => {
      // Обновляем последний период, чтобы он заканчивался на целевую дату
      const updated = [...prevPeriods];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          endMonth: newEndDate,
        };
      }
      return updated;
    });
  }, [targetDate]);

  // Выполнение расчета
  const handleCalculate = useCallback(() => {
    setCalculationError(null);
    
    if (!validateInputs()) {
      return;
    }

    try {
      const result = calculateSavings({
        initialAmount,
        targetDate,
        monthlyContribution,
        ratePeriods,
      });
      setCalculationResult(result);
    } catch (error) {
      setCalculationError(error instanceof Error ? error.message : 'Произошла ошибка при расчете');
      setCalculationResult(null);
    }
  }, [initialAmount, targetDate, monthlyContribution, ratePeriods, validateInputs]);

  // Автоматический расчет при изменении данных (опционально, можно убрать)
  const shouldAutoCalculate = useMemo(() => {
    return initialAmount > 0 && monthlyContribution >= 0 && 
           normalizeToMonthStart(targetDate) > getCurrentMonthStart() &&
           ratePeriods.length > 0;
  }, [initialAmount, targetDate, monthlyContribution, ratePeriods]);

  React.useEffect(() => {
    if (shouldAutoCalculate && Object.keys(errors).length === 0) {
      try {
        const result = calculateSavings({
          initialAmount,
          targetDate,
          monthlyContribution,
          ratePeriods,
        });
        setCalculationResult(result);
        setCalculationError(null);
      } catch (error) {
        // Тихо игнорируем ошибки при авторасчете
      }
    }
  }, [initialAmount, targetDate, monthlyContribution, ratePeriods, shouldAutoCalculate, errors]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Калькулятор накоплений на вклады
        </h1>
        
        <InputForm
          initialAmount={initialAmount}
          targetDate={targetDate}
          monthlyContribution={monthlyContribution}
          ratePeriods={ratePeriods}
          onInitialAmountChange={setInitialAmount}
          onTargetDateChange={setTargetDate}
          onMonthlyContributionChange={setMonthlyContribution}
          onRatePeriodsChange={setRatePeriods}
          onResetRatePeriods={resetRatePeriods}
          errors={errors}
        />

        {calculationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Ошибка расчета:</p>
            <p className="text-red-600">{calculationError}</p>
          </div>
        )}

        {calculationResult && <ResultsReport result={calculationResult} />}
      </div>
    </div>
  );
}

export default App;