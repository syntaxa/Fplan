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
  );
}
