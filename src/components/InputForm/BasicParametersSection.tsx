import { DateInput } from '../common/DateInput';
import { NumberInput } from '../common/NumberInput';
import { getCurrentMonthStart, addMonthsToDate } from '../../utils/dateUtils';

interface BasicParametersSectionProps {
  initialAmount: number;
  targetDate: Date;
  monthlyContribution: number;
  onInitialAmountChange: (value: number) => void;
  onTargetDateChange: (value: Date) => void;
  onMonthlyContributionChange: (value: number) => void;
  errors?: {
    initialAmount?: string;
    targetDate?: string;
    monthlyContribution?: string;
  };
}

export function BasicParametersSection({
  initialAmount,
  targetDate,
  monthlyContribution,
  onInitialAmountChange,
  onTargetDateChange,
  onMonthlyContributionChange,
  errors,
}: BasicParametersSectionProps) {
  // Минимальная целевая дата - следующий месяц от текущего
  const minTargetDate = addMonthsToDate(getCurrentMonthStart(), 1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Основные параметры
      </h2>
      
      <div className="space-y-6">
        {/* Поля ввода - сжатые */}
        <div className="max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberInput
              label="Начальная сумма"
              value={initialAmount}
              onChange={onInitialAmountChange}
              min={0}
              step={1000}
              suffix="₽"
              error={errors?.initialAmount}
              required
            />
            
            <DateInput
              label="Целевая дата"
              value={targetDate}
              onChange={onTargetDateChange}
              min={minTargetDate}
              error={errors?.targetDate}
              required
            />
            
            <NumberInput
              label="Ежемесячный взнос"
              value={monthlyContribution}
              onChange={onMonthlyContributionChange}
              min={0}
              step={1000}
              suffix="₽"
              error={errors?.monthlyContribution}
              required
            />
          </div>
          
          <p className="mt-4 text-sm text-gray-600">
            💡 Взносы накапливаются 3 месяца и добавляются к сумме при открытии каждого нового вклада.
          </p>
        </div>

        {/* Блок с описанием - на всю ширину */}
        <div className="w-full">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              Как пользоваться калькулятором
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p className="mb-2">
                <strong>Назначение:</strong> Планируйте накопления на краткосрочных вкладах (3 месяца) с учетом капитализации процентов и регулярных пополнений.
              </p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Укажите начальную сумму для первого вклада</li>
                <li>Выберите целевую дату, когда планируете снять средства</li>
                <li>Введите ежемесячный взнос (накапливается 3 месяца)</li>
                <li>Настройте процентные ставки по периодам ниже</li>
                <li>Результаты расчета отобразятся автоматически</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
