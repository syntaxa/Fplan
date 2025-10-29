import Decimal from 'decimal.js';

// Настройка Decimal.js для работы с деньгами
// Округление до 2 знаков после запятой (копейки)
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP, toExpNeg: -7e15 });

/**
 * Создает Decimal из числа или строки
 */
export function toDecimal(value: number | string | Decimal): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(value);
}

/**
 * Округляет до копеек (2 знака после запятой)
 */
export function roundToCents(value: Decimal | number): number {
  const decimal = value instanceof Decimal ? value : toDecimal(value);
  return decimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Выполняет финансовые операции с автоматическим округлением
 */
export class Money {
  private value: Decimal;

  constructor(value: number | string | Decimal) {
    this.value = toDecimal(value);
  }

  /**
   * Сложение
   */
  add(other: number | string | Decimal | Money): Money {
    const otherValue = other instanceof Money ? other.value : toDecimal(other);
    return new Money(this.value.plus(otherValue));
  }

  /**
   * Вычитание
   */
  subtract(other: number | string | Decimal | Money): Money {
    const otherValue = other instanceof Money ? other.value : toDecimal(other);
    return new Money(this.value.minus(otherValue));
  }

  /**
   * Умножение
   */
  multiply(other: number | string | Decimal | Money): Money {
    const otherValue = other instanceof Money ? other.value : toDecimal(other);
    return new Money(this.value.times(otherValue));
  }

  /**
   * Деление
   */
  divide(other: number | string | Decimal | Money): Money {
    const otherValue = other instanceof Money ? other.value : toDecimal(other);
    return new Money(this.value.dividedBy(otherValue));
  }

  /**
   * Получить значение как число, округленное до копеек
   */
  toNumber(): number {
    return roundToCents(this.value);
  }

  /**
   * Получить Decimal значение (для промежуточных вычислений)
   */
  toDecimal(): Decimal {
    return this.value;
  }

  /**
   * Сравнение (больше)
   */
  isGreaterThan(other: number | string | Decimal | Money): boolean {
    const otherValue = other instanceof Money ? other.value : toDecimal(other);
    return this.value.greaterThan(otherValue);
  }

  /**
   * Сравнение (меньше)
   */
  isLessThan(other: number | string | Decimal | Money): boolean {
    const otherValue = other instanceof Money ? other.value : toDecimal(other);
    return this.value.lessThan(otherValue);
  }

  /**
   * Сравнение (равно)
   */
  equals(other: number | string | Decimal | Money): boolean {
    const otherValue = other instanceof Money ? other.value : toDecimal(other);
    return this.value.equals(otherValue);
  }
}

/**
 * Вычисляет проценты от суммы (месячная ставка)
 * @param principal Основная сумма
 * @param annualRate Годовая ставка в процентах (например, 15 для 15%)
 * @returns Проценты за месяц, округленные до копеек
 */
export function calculateMonthlyInterest(
  principal: number,
  annualRate: number
): number {
  const principalDecimal = toDecimal(principal);
  const monthlyRate = toDecimal(annualRate).dividedBy(12).dividedBy(100);
  const interest = principalDecimal.times(monthlyRate);
  return roundToCents(interest);
}

/**
 * Форматирует число как денежную сумму (с разделителями тысяч и знаком рубля)
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Форматирует число с разделителями тысяч
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
