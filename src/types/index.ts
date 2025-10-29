export interface InputParameters {
  initialAmount: number;           // Начальная сумма
  targetDate: Date;                // Целевая дата
  monthlyContribution: number;     // Ежемесячный взнос
  ratePeriods: RatePeriod[];       // Периоды процентных ставок
}

export interface RatePeriod {
  id: string;                      // Уникальный идентификатор
  startMonth: Date;                // Начало периода (первое число месяца)
  endMonth: Date;                  // Конец периода (последнее число месяца)
  annualRate: number;              // Годовая ставка (например, 16.5 для 16.5%)
}

export interface CalculationResult {
  finalAmount: number;             // Итоговая сумма
  totalContributions: number;      // Сумма всех взносов
  totalInterest: number;           // Сумма всех процентов
  effectiveYield: number;          // Эффективная доходность (%)
  cycles: DepositCycle[];          // Детализация по циклам
}

export interface DepositCycle {
  cycleNumber: number;             // Номер цикла
  openDate: Date;                  // Дата открытия
  closeDate: Date;                 // Дата закрытия
  openingAmount: number;           // Сумма при открытии
  appliedRate: number;             // Применяемая ставка
  interestEarned: number;          // Начисленные проценты
  closingAmount: number;           // Сумма при закрытии
  monthlyDetails: MonthDetail[];   // Детали по месяцам цикла
}

export interface MonthDetail {
  month: Date;                     // Месяц
  balanceStart: number;            // Баланс на начало месяца
  interestAccrued: number;         // Начисленные проценты
  balanceEnd: number;              // Баланс на конец месяца
}
