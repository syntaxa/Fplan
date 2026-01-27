import React, { useState, useCallback, useMemo } from 'react';
import type { RatePeriod } from '../../types';
import { 
  getCurrentMonthStart, 
  getDepositEndDates,
  addMonthsToDate,
  monthsBetween,
  normalizeToMonthStart,
} from '../../utils/dateUtils';
import { RatePeriodSegment } from './RatePeriodSegment';
import { RateDivider } from './RateDivider';

interface RateChartProps {
  ratePeriods: RatePeriod[];
  targetDate: Date;
  onRatePeriodsChange: (periods: RatePeriod[]) => void;
}

const CHART_HEIGHT = 300;
const CHART_MARGIN_LEFT = 80;
const CHART_MARGIN_RIGHT = 40;
const CHART_MARGIN_TOP = 20;
const CHART_MARGIN_BOTTOM = 60;
const CHART_CONTENT_HEIGHT = CHART_HEIGHT - CHART_MARGIN_TOP - CHART_MARGIN_BOTTOM;
const CHART_CONTENT_WIDTH = 800 - CHART_MARGIN_LEFT - CHART_MARGIN_RIGHT;

const MIN_RATE = 1;
const MAX_RATE = 30;
const RATE_STEP = 1;
const RATE_SENSITIVITY_ZONE = 40; // Пикселей вверх и вниз от линии графика
const AXIS_PROTECTION_ZONE = 10; // Зона защиты горизонтальной оси от кликов

export function RateChart({
  ratePeriods,
  targetDate,
  onRatePeriodsChange,
}: RateChartProps) {
  const [hoveredPeriodId, setHoveredPeriodId] = useState<string | null>(null);
  const [hoveredDividerIndex, setHoveredDividerIndex] = useState<number | null>(null);
  const [draggedPeriodId, setDraggedPeriodId] = useState<string | null>(null);
  const [draggedDividerIndex, setDraggedDividerIndex] = useState<number | null>(null);
  const [, setDragStartY] = useState<number>(0);
  const [, setDragStartX] = useState<number>(0);
  const [, setDragStartRate] = useState<number>(0);
  const [dragMousePosition, setDragMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrentRate, setDragCurrentRate] = useState<number | null>(null);

  const startDate = getCurrentMonthStart();
  const endDate = normalizeToMonthStart(targetDate);

  // Даты окончания вкладов (каждые 3 месяца)
  const depositEndDates = useMemo(() => {
    return getDepositEndDates(startDate, endDate);
  }, [startDate, endDate]);

  // Вычисляем координаты для периода
  // Периоды идут последовательно без промежутков: если период заканчивается в марте,
  // следующий начинается в апреле
  const getPeriodCoords = useCallback((period: RatePeriod) => {
    const periodStart = normalizeToMonthStart(period.startMonth);
    const periodEnd = normalizeToMonthStart(period.endMonth);
    
    // Начало периода: количество месяцев от стартовой даты до начала периода
    const startMonths = monthsBetween(startDate, periodStart);
    
    // Конец периода: количество месяцев от стартовой даты до конца периода + 1
    // (так как период включает весь месяц окончания)
    const endMonths = monthsBetween(startDate, periodEnd) + 1;
    
    const totalMonths = monthsBetween(startDate, endDate) + 1;
    const xStart = (startMonths / totalMonths) * CHART_CONTENT_WIDTH + CHART_MARGIN_LEFT;
    const xEnd = (endMonths / totalMonths) * CHART_CONTENT_WIDTH + CHART_MARGIN_LEFT;
    
    const yRate = ((period.annualRate - MIN_RATE) / (MAX_RATE - MIN_RATE)) * CHART_CONTENT_HEIGHT;
    const y = CHART_CONTENT_HEIGHT - yRate + CHART_MARGIN_TOP;
    
    return { xStart, xEnd, y, yRate };
  }, [startDate, endDate]);

  // Получаем индексы разделителей (между периодами)
  const dividerDates = useMemo(() => {
    return ratePeriods
      .slice(1)
      .map((period) => normalizeToMonthStart(period.startMonth));
  }, [ratePeriods]);

  const handlePeriodMouseDown = useCallback((e: React.MouseEvent, period: RatePeriod) => {
    e.preventDefault();
    setDraggedPeriodId(period.id);
    setDragStartY(e.clientY);
    setDragStartRate(period.annualRate);
  }, []);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent, dividerIndex: number) => {
    e.preventDefault();
    setDraggedDividerIndex(dividerIndex);
    setDragStartX(e.clientX);
  }, []);

  const svgRef = React.useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!svgRef.current) return;

    if (draggedPeriodId) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgY = e.clientY - rect.top - CHART_MARGIN_TOP;
      const ratePercent = 1 - (svgY / CHART_CONTENT_HEIGHT);
      const newRate = MIN_RATE + ratePercent * (MAX_RATE - MIN_RATE);
      const clampedRate = Math.max(MIN_RATE, Math.min(MAX_RATE, newRate));
      const snappedRate = Math.round(clampedRate / RATE_STEP) * RATE_STEP;

      // Сохраняем позицию мыши и текущую ставку для отображения
      setDragMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDragCurrentRate(snappedRate);

      const updatedPeriods = ratePeriods.map((period) =>
        period.id === draggedPeriodId
          ? { ...period, annualRate: snappedRate }
          : period
      );
      onRatePeriodsChange(updatedPeriods);
    } else if (draggedDividerIndex !== null && draggedDividerIndex >= 0 && draggedDividerIndex < ratePeriods.length - 1) {
      // Перемещение разделителя - привязка к ближайшей дате окончания вклада
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = e.clientX - rect.left - CHART_MARGIN_LEFT;
      const totalMonths = monthsBetween(startDate, endDate) + 1;
      const clickedMonths = (svgX / CHART_CONTENT_WIDTH) * totalMonths;
      
      // Найти ближайшую дату окончания вклада (snap к датам окончания вкладов)
      let nearestDate = depositEndDates[0];
      let minDistance = Infinity;
      
      for (const date of depositEndDates) {
        const months = monthsBetween(startDate, date);
        const distance = Math.abs(months - clickedMonths);
        if (distance < minDistance) {
          minDistance = distance;
          nearestDate = date;
        }
      }
      
      // Обновляем разделитель только если это другая дата
      const currentDividerDate = dividerDates[draggedDividerIndex];
      const currentPeriodEnd = normalizeToMonthStart(ratePeriods[draggedDividerIndex].endMonth);
      const nextPeriodStart = normalizeToMonthStart(ratePeriods[draggedDividerIndex + 1].startMonth);
      
      // Проверяем, что новая дата не конфликтует с существующими периодами
      if (nearestDate.getTime() !== currentDividerDate.getTime() && 
          nearestDate.getTime() !== currentPeriodEnd.getTime() &&
          nearestDate.getTime() !== nextPeriodStart.getTime()) {
        const updatedPeriods = [...ratePeriods];
        const periodIndex = draggedDividerIndex + 1;
        
        if (periodIndex < updatedPeriods.length) {
          // Предыдущий период заканчивается в месяц ПЕРЕД новым началом
          updatedPeriods[draggedDividerIndex] = {
            ...updatedPeriods[draggedDividerIndex],
            endMonth: addMonthsToDate(nearestDate, -1),
          };
          // Следующий период начинается с новой даты
          updatedPeriods[periodIndex] = {
            ...updatedPeriods[periodIndex],
            startMonth: nearestDate,
          };
          onRatePeriodsChange(updatedPeriods);
        }
      }
    }
  }, [draggedPeriodId, draggedDividerIndex, ratePeriods, onRatePeriodsChange, startDate, endDate, depositEndDates, dividerDates]);

  const handleMouseUp = useCallback(() => {
    setDraggedPeriodId(null);
    setDraggedDividerIndex(null);
    setDragMousePosition(null);
    setDragCurrentRate(null);
  }, []);

  React.useEffect(() => {
    if (draggedPeriodId !== null || draggedDividerIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedPeriodId, draggedDividerIndex, handleMouseMove, handleMouseUp]);

  const handleDateClick = useCallback((date: Date) => {
    // Найти период, к которому относится эта дата
    const clickedMonth = normalizeToMonthStart(date);
    
    for (let i = 0; i < ratePeriods.length; i++) {
      const period = ratePeriods[i];
      const periodStart = normalizeToMonthStart(period.startMonth);
      const periodEnd = normalizeToMonthStart(period.endMonth);
      
      if (clickedMonth >= periodStart && clickedMonth <= periodEnd) {
        // Разделить период на этой дате
        const newPeriod1 = {
          ...period,
          endMonth: addMonthsToDate(clickedMonth, -1),
        };
        const newPeriod2 = {
          ...ratePeriods[i],
          id: `${period.id}-split-${Date.now()}`,
          startMonth: clickedMonth,
          annualRate: period.annualRate,
        };
        
        const updatedPeriods = [
          ...ratePeriods.slice(0, i),
          newPeriod1,
          newPeriod2,
          ...ratePeriods.slice(i + 1),
        ];
        
        onRatePeriodsChange(updatedPeriods);
        break;
      }
    }
  }, [ratePeriods, onRatePeriodsChange]);

  const handleDividerDoubleClick = useCallback((dividerIndex: number) => {
    // Удалить разделитель - объединить периоды
    if (dividerIndex >= 0 && dividerIndex < ratePeriods.length - 1) {
      const periodBefore = ratePeriods[dividerIndex];
      const periodAfter = ratePeriods[dividerIndex + 1];
      
      const mergedPeriod = {
        ...periodBefore,
        endMonth: periodAfter.endMonth,
      };
      
      const updatedPeriods = [
        ...ratePeriods.slice(0, dividerIndex),
        mergedPeriod,
        ...ratePeriods.slice(dividerIndex + 2),
      ];
      
      onRatePeriodsChange(updatedPeriods);
    }
  }, [ratePeriods, onRatePeriodsChange]);

  // Находим максимальную и минимальную ставку для масштабирования
  const maxRate = Math.max(...ratePeriods.map(p => p.annualRate), MAX_RATE);
  const minRate = Math.min(...ratePeriods.map(p => p.annualRate), MIN_RATE);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width="800"
        height={CHART_HEIGHT}
        className="border border-gray-300 rounded-lg bg-white"
      >
        {/* Сетка - вертикальные линии на датах окончания вкладов с подписями */}
        {depositEndDates.map((date, index) => {
          const months = monthsBetween(startDate, date);
          const totalMonths = monthsBetween(startDate, endDate) + 1;
          // Позиция линии соответствует началу следующего месяца (после окончания вклада)
          const x = (months / totalMonths) * CHART_CONTENT_WIDTH + CHART_MARGIN_LEFT;
          
          return (
            <g key={`grid-${index}`}>
              <line
                x1={x}
                x2={x}
                y1={CHART_MARGIN_TOP}
                y2={CHART_HEIGHT - CHART_MARGIN_BOTTOM}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              {/* Маркер точки разделения */}
              <circle
                cx={x}
                cy={CHART_MARGIN_TOP + CHART_CONTENT_HEIGHT}
                r={4}
                fill="#6b7280"
                className="cursor-pointer hover:fill-blue-500"
                onClick={() => handleDateClick(date)}
              />
              {/* Подпись даты на оси - немного ниже уровня 0% на графике */}
              <text
                x={x}
                y={CHART_MARGIN_TOP + CHART_CONTENT_HEIGHT + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
              </text>
              {/* Метка на оси - на уровне нижней границы графика (0%) */}
              <line
                x1={x}
                x2={x}
                y1={CHART_MARGIN_TOP + CHART_CONTENT_HEIGHT}
                y2={CHART_MARGIN_TOP + CHART_CONTENT_HEIGHT + 5}
                stroke="#6b7280"
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* Горизонтальные линии для ставок */}
        {[5, 10, 15, 20, 25, 30].map((rate) => {
          if (rate < minRate || rate > maxRate) return null;
          const y = CHART_CONTENT_HEIGHT - ((rate - MIN_RATE) / (MAX_RATE - MIN_RATE)) * CHART_CONTENT_HEIGHT + CHART_MARGIN_TOP;
          return (
            <line
              key={`rate-line-${rate}`}
              x1={CHART_MARGIN_LEFT}
              x2={CHART_MARGIN_LEFT + CHART_CONTENT_WIDTH}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Оси */}
        <text
          x={CHART_MARGIN_LEFT + CHART_CONTENT_WIDTH / 2}
          y={CHART_HEIGHT - 10}
          textAnchor="middle"
          className="text-sm fill-gray-700"
        >
          Время
        </text>
        <text
          x={20}
          y={CHART_HEIGHT / 2}
          textAnchor="middle"
          className="text-sm fill-gray-700"
          transform={`rotate(-90, 20, ${CHART_HEIGHT / 2})`}
        >
          Процентная ставка (%)
        </text>

        {/* Подписи ставок слева */}
        {[5, 10, 15, 20, 25, 30].map((rate) => {
          const y = CHART_CONTENT_HEIGHT - ((rate - MIN_RATE) / (MAX_RATE - MIN_RATE)) * CHART_CONTENT_HEIGHT + CHART_MARGIN_TOP;
          return (
            <text
              key={`rate-label-${rate}`}
              x={CHART_MARGIN_LEFT - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-gray-600"
            >
              {rate}%
            </text>
          );
        })}

        {/* Периоды с расширенными зонами чувствительности */}
        {ratePeriods.map((period) => {
          const { xStart, xEnd, yRate } = getPeriodCoords(period);
          const periodWidth = xEnd - xStart;
          
          // Y координата линии графика (уровень ставки)
          const lineY = CHART_MARGIN_TOP + CHART_CONTENT_HEIGHT - yRate;
          
          // Вычисляем зону чувствительности: 40px вверх и вниз от линии
          const zoneTop = Math.max(CHART_MARGIN_TOP, lineY - RATE_SENSITIVITY_ZONE);
          const zoneBottom = Math.min(
            CHART_MARGIN_TOP + CHART_CONTENT_HEIGHT - AXIS_PROTECTION_ZONE, // Защита оси
            lineY + RATE_SENSITIVITY_ZONE
          );
          const zoneHeight = zoneBottom - zoneTop;
          
          return (
            <g key={period.id}>
              {/* Невидимая зона для изменения ставки - 40px вверх и вниз от линии графика */}
              {zoneHeight > 0 && (
                <rect
                  x={xStart}
                  y={zoneTop}
                  width={periodWidth}
                  height={zoneHeight}
                  fill="transparent"
                  className="cursor-move"
                  onMouseEnter={() => setHoveredPeriodId(period.id)}
                  onMouseLeave={() => setHoveredPeriodId(null)}
                  onMouseDown={(e) => {
                    // Вычисляем ставку из позиции мыши по Y
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (rect) {
                      const svgY = e.clientY - rect.top - CHART_MARGIN_TOP;
                      const ratePercent = 1 - (svgY / CHART_CONTENT_HEIGHT);
                      const newRate = MIN_RATE + ratePercent * (MAX_RATE - MIN_RATE);
                      const clampedRate = Math.max(MIN_RATE, Math.min(MAX_RATE, newRate));
                      const snappedRate = Math.round(clampedRate / RATE_STEP) * RATE_STEP;
                      
                      const updatedPeriods = ratePeriods.map((p) =>
                        p.id === period.id
                          ? { ...p, annualRate: snappedRate }
                          : p
                      );
                      onRatePeriodsChange(updatedPeriods);
                      
                      // Начинаем перетаскивание для дальнейшего изменения
                      setDraggedPeriodId(period.id);
                      setDragStartY(e.clientY);
                      setDragStartRate(snappedRate);
                      
                      // Устанавливаем позицию мыши и ставку для отображения индикатора
                      setDragMousePosition({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                      setDragCurrentRate(snappedRate);
                    }
                  }}
                />
              )}
              {/* Визуальный сегмент графика */}
              <RatePeriodSegment
                xStart={xStart}
                xEnd={xEnd}
                yRate={yRate}
                height={CHART_CONTENT_HEIGHT + CHART_MARGIN_TOP}
                isHovered={hoveredPeriodId === period.id}
                onMouseEnter={() => setHoveredPeriodId(period.id)}
                onMouseLeave={() => setHoveredPeriodId(null)}
                onMouseDown={(e) => handlePeriodMouseDown(e, period)}
              />
            </g>
          );
        })}

        {/* Разделители между периодами */}
        {dividerDates.map((date, index) => {
          // Координата разделителя - начало следующего периода
          const periodStart = normalizeToMonthStart(date);
          const months = monthsBetween(startDate, periodStart);
          const totalMonths = monthsBetween(startDate, endDate) + 1;
          const x = (months / totalMonths) * CHART_CONTENT_WIDTH + CHART_MARGIN_LEFT;
          
          if (index < ratePeriods.length - 1) {
            return (
              <RateDivider
                key={`divider-${index}`}
                x={x}
                height={CHART_CONTENT_HEIGHT + CHART_MARGIN_TOP}
                date={date}
                rateBefore={ratePeriods[index]?.annualRate || 0}
                rateAfter={ratePeriods[index + 1]?.annualRate || 0}
                isHovered={hoveredDividerIndex === index}
                onMouseEnter={() => setHoveredDividerIndex(index)}
                onMouseLeave={() => setHoveredDividerIndex(null)}
                onMouseDown={(e) => handleDividerMouseDown(e, index)}
                onDoubleClick={() => handleDividerDoubleClick(index)}
              />
            );
          }
          return null;
        })}
        
        {/* Индикатор текущей ставки при перетаскивании */}
        {dragMousePosition && dragCurrentRate !== null && (
          <text
            x={dragMousePosition.x}
            y={dragMousePosition.y - 10}
            textAnchor="middle"
            className="fill-red-600 font-bold"
            style={{ fontSize: '150%' }}
          >
            {dragCurrentRate.toFixed(2)}%
          </text>
        )}
      </svg>
    </div>
  );
}
