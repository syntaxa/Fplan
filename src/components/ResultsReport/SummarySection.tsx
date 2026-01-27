import type { CalculationResult } from '../../types';
import { formatMoney, formatNumber } from '../../utils/decimalUtils';

interface SummarySectionProps {
  result: CalculationResult;
}

export function SummarySection({ result }: SummarySectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Итоговые показатели
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-600 mb-1">Итоговая сумма</div>
          <div className="text-2xl font-bold text-blue-700">
            {formatMoney(result.finalAmount)}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Внесено средств</div>
          <div className="text-2xl font-bold text-green-700">
            {formatMoney(result.totalContributions)}
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Начислено процентов</div>
          <div className="text-2xl font-bold text-purple-700">
            {formatMoney(result.totalInterest)}
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-gray-600 mb-1">Эффективная доходность</div>
          <div className="text-2xl font-bold text-orange-700">
            {formatNumber(result.effectiveYield)}%
          </div>
        </div>
      </div>
    </div>
  );
}
