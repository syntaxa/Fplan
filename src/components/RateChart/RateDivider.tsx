import React from 'react';

interface RateDividerProps {
  x: number;
  height: number;
  date: Date;
  rateBefore: number;
  rateAfter: number;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}

export function RateDivider({
  x,
  height,
  date,
  rateBefore,
  rateAfter,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onDoubleClick,
}: RateDividerProps) {
  const dateStr = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <g>
      {/* Вертикальная линия разделителя */}
      <line
        x1={x}
        x2={x}
        y1={0}
        y2={height}
        stroke={isHovered ? '#3b82f6' : '#9ca3af'}
        strokeWidth={isHovered ? 3 : 2}
        strokeDasharray={isHovered ? '0' : '4 4'}
        className="cursor-col-resize"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      />
      {/* Кнопка удаления при наведении */}
      {isHovered && (
        <g>
          <circle
            cx={x}
            cy={10}
            r={12}
            fill="#ef4444"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDoubleClick?.();
            }}
          />
          <text
            x={x}
            y={14}
            textAnchor="middle"
            className="text-white text-xs font-bold fill-white pointer-events-none"
          >
            ×
          </text>
        </g>
      )}
      {/* Tooltip */}
      {isHovered && (
        <foreignObject x={x + 10} y={20} width="200" height="100">
          <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg">
            <div>{dateStr}</div>
            <div>{rateBefore}% → {rateAfter}%</div>
            <div className="text-gray-400 mt-1">Тяните: переместить</div>
            <div className="text-gray-400">×: удалить</div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}
