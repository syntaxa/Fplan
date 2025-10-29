import type {
  InputParameters,
  RatePeriod,
  CalculationResult,
  DepositCycle,
  MonthDetail,
} from '../types';
import {
  normalizeToMonthStart,
  addMonthsToDate,
  monthsBetween,
  getCurrentMonthStart,
} from './dateUtils';
import {
  Money,
  calculateMonthlyInterest,
} from './decimalUtils';

/**
 * Находит ставку для указанной даты из списка периодов
 * @throws Error если ставка не найдена
 */
function findRateForDate(date: Date, ratePeriods: RatePeriod[]): number {
  const normalizedDate = normalizeToMonthStart(date);
  
  for (const period of ratePeriods) {
    const startMonth = normalizeToMonthStart(period.startMonth);
    const endMonth = normalizeToMonthStart(period.endMonth);
    
    if (normalizedDate >= startMonth && normalizedDate <= endMonth) {
      return period.annualRate;
    }
  }
  
  throw new Error(`Ставка не определена для даты ${date.toLocaleDateString('ru-RU')}`);
}

/**
 * Основная функция расчета накоплений
 */
export function calculateSavings(parameters: InputParameters): CalculationResult {
  // Нормализация входных дат
  const currentDate = normalizeToMonthStart(getCurrentMonthStart());
  const targetDate = normalizeToMonthStart(parameters.targetDate);
  
  if (targetDate <= currentDate) {
    throw new Error('Целевая дата должна быть в будущем');
  }
  
  // Инициализация переменных
  let currentAmount = new Money(parameters.initialAmount);
  let cycleDate = new Date(currentDate);
  const cycles: DepositCycle[] = [];
  let cycleNumber = 1;
  
  // Расчет циклов вкладов
  while (cycleDate < targetDate) {
    // Определение длительности цикла
    const monthsUntilTarget = monthsBetween(cycleDate, targetDate);
    const cycleDuration = Math.min(3, monthsUntilTarget);
    
    // Добавление накопленных средств (взносы накапливаются и добавляются при открытии)
    const contributionsToAdd = new Money(parameters.monthlyContribution)
      .multiply(cycleDuration);
    const openingAmount = currentAmount.add(contributionsToAdd);
    
    // Определение применяемой ставки
    const appliedRate = findRateForDate(cycleDate, parameters.ratePeriods);
    
    // Расчет по месяцам цикла
    const monthlyDetails: MonthDetail[] = [];
    let balanceStart = openingAmount;
    
    for (let monthOffset = 0; monthOffset < cycleDuration; monthOffset++) {
      const monthDate = addMonthsToDate(cycleDate, monthOffset);
      
      // Начисление процентов за месяц
      const interestAccrued = new Money(
        calculateMonthlyInterest(balanceStart.toNumber(), appliedRate)
      );
      
      // Капитализация (добавление процентов к телу вклада)
      const balanceEnd = balanceStart.add(interestAccrued);
      
      monthlyDetails.push({
        month: monthDate,
        balanceStart: balanceStart.toNumber(),
        interestAccrued: interestAccrued.toNumber(),
        balanceEnd: balanceEnd.toNumber(),
      });
      
      balanceStart = balanceEnd;
    }
    
    // Сохранение результатов цикла
    const closingAmount = balanceStart;
    const totalInterest = closingAmount.subtract(openingAmount);
    
    const closeDate = addMonthsToDate(cycleDate, cycleDuration);
    
    cycles.push({
      cycleNumber,
      openDate: new Date(cycleDate),
      closeDate: new Date(closeDate),
      openingAmount: openingAmount.toNumber(),
      appliedRate,
      interestEarned: totalInterest.toNumber(),
      closingAmount: closingAmount.toNumber(),
      monthlyDetails,
    });
    
    // Переход к следующему циклу
    currentAmount = closingAmount;
    cycleDate = closeDate;
    cycleNumber++;
  }
  
  // Формирование итогового результата
  const finalAmount = currentAmount.toNumber();
  
  // Вычисление общего количества месяцев
  const totalMonths = monthsBetween(currentDate, targetDate);
  const totalContributions = new Money(parameters.initialAmount)
    .add(new Money(parameters.monthlyContribution).multiply(totalMonths))
    .toNumber();
  
  const totalInterestAmount = new Money(finalAmount).subtract(totalContributions);
  const effectiveYield = totalContributions > 0
    ? totalInterestAmount.divide(totalContributions).multiply(100).toNumber()
    : 0;
  
  return {
    finalAmount,
    totalContributions,
    totalInterest: totalInterestAmount.toNumber(),
    effectiveYield,
    cycles,
  };
}
