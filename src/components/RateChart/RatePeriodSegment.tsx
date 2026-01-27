import React from 'react';

interface RatePeriodSegmentProps {
  xStart: number;
  xEnd: number;
  yRate: number;
  height: number;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function RatePeriodSegment({
  xStart,
  xEnd,
  yRate,
  height,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
}: RatePeriodSegmentProps) {
  const width = xEnd - xStart;
  const y = height - yRate;

  return (
    <g>
      {/* Горизонтальная линия периода */}
      <line
        x1={xStart}
        x2={xEnd}
        y1={y}
        y2={y}
        stroke={isHovered ? '#3b82f6' : '#60a5fa'}
        strokeWidth={isHovered ? 4 : 3}
        strokeLinecap="round"
        className="cursor-move"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
      />
      {/* Вертикальная линия справа */}
      {xEnd > xStart && (
        <line
          x1={xEnd}
          x2={xEnd}
          y1={y}
          y2={height}
          stroke={isHovered ? '#3b82f6' : '#60a5fa'}
          strokeWidth={isHovered ? 4 : 3}
          strokeLinecap="round"
        />
      )}
      {/* Подсветка при наведении */}
      {isHovered && (
        <rect
          x={xStart}
          y={0}
          width={width}
          height={height}
          fill="#3b82f6"
          opacity={0.1}
        />
      )}
    </g>
  );
}
