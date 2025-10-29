import React, { useState } from 'react';
import type { DepositCycle } from '../../types';
import { formatDate, formatMonthYear } from '../../utils/dateUtils';
import { formatMoney, formatNumber } from '../../utils/decimalUtils';

interface CyclesDetailTableProps {
  cycles: DepositCycle[];
}

export function CyclesDetailTable({ cycles }: CyclesDetailTableProps) {
  const [expandedCycles, setExpandedCycles] = useState<Set<number>>(new Set());

  const toggleCycle = (cycleNumber: number) => {
    const newExpanded = new Set(expandedCycles);
    if (newExpanded.has(cycleNumber)) {
      newExpanded.delete(cycleNumber);
    } else {
      newExpanded.add(cycleNumber);
    }
    setExpandedCycles(newExpanded);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Детализация по циклам вкладов
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                №
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата открытия
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата закрытия
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма открытия
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ставка
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Начислено
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма закрытия
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Детали
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cycles.map((cycle) => {
              const isExpanded = expandedCycles.has(cycle.cycleNumber);
              
              return (
                <React.Fragment key={cycle.cycleNumber}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cycle.cycleNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(cycle.openDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(cycle.closeDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatMoney(cycle.openingAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatNumber(cycle.appliedRate)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatMoney(cycle.interestEarned)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMoney(cycle.closingAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleCycle(cycle.cycleNumber)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {isExpanded ? 'Скрыть' : 'Показать'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 bg-gray-50">
                        <div className="mb-2 text-sm font-medium text-gray-700">
                          Помесячная детализация:
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                Месяц
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                Баланс на начало
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                Начислено процентов
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                Баланс на конец
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cycle.monthlyDetails.map((detail, index) => (
                              <tr key={index} className="bg-white">
                                <td className="px-3 py-2 text-xs text-gray-700">
                                  {formatMonthYear(detail.month)}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-700">
                                  {formatMoney(detail.balanceStart)}
                                </td>
                                <td className="px-3 py-2 text-xs text-green-600">
                                  {formatMoney(detail.interestAccrued)}
                                </td>
                                <td className="px-3 py-2 text-xs font-medium text-gray-900">
                                  {formatMoney(detail.balanceEnd)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
