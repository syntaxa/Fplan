import { startOfMonth, addMonths, differenceInMonths, format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

/**
 * Нормализует дату к началу месяца
 */
export function normalizeToMonthStart(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Добавляет указанное количество месяцев к дате
 */
export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}

/**
 * Вычисляет разницу в месяцах между двумя датами
 */
export function monthsBetween(startDate: Date, endDate: Date): number {
  return differenceInMonths(normalizeToMonthStart(endDate), normalizeToMonthStart(startDate));
}

/**
 * Получает дату начала текущего месяца
 */
export function getCurrentMonthStart(): Date {
  return normalizeToMonthStart(new Date());
}

/**
 * Форматирует дату для отображения (русская локализация)
 */
export function formatDate(date: Date, formatStr: string = 'dd.MM.yyyy'): string {
  return format(date, formatStr, { locale: ru });
}

/**
 * Форматирует дату как "Месяц Год" (например, "Январь 2026")
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'LLLL yyyy', { locale: ru });
}

/**
 * Генерирует массив дат окончания вкладов (каждые 3 месяца)
 */
export function getDepositEndDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let current = normalizeToMonthStart(startDate);
  const target = normalizeToMonthStart(endDate);
  
  // Первая дата - текущая (начало первого вклада)
  dates.push(new Date(current));
  
  // Добавляем даты каждые 3 месяца
  while (current < target) {
    current = addMonthsToDate(current, 3);
    if (current <= target) {
      dates.push(new Date(current));
    }
  }
  
  return dates;
}
