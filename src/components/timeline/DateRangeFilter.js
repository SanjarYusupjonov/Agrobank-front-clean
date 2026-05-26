import React from 'react';
import { Calendar, ArrowRight, X } from 'lucide-react';

const QUICK_RANGES = [
  { label: 'Bugun', days: 0 },
  { label: '7 kun', days: 7 },
  { label: '30 kun', days: 30 },
];

const DateRangeFilter = ({
  fromDate,
  toDate,
  activeFrom,
  activeTo,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  onQuickRange,
  loading,
}) => {
  const isActive = !!(activeFrom && activeTo);

  return (
    <div className={`att-daterange-bar${isActive ? ' att-daterange-bar--active' : ''}`}>
      <div className="att-daterange-label">
        <Calendar size={13} />
        <span>Sana oralig'i:</span>
      </div>
      <div className="att-quick-ranges">
        <span className="att-quick-label">Tezkor:</span>
        {QUICK_RANGES.map(q => (
          <button key={q.days} className="quick-btn" onClick={() => onQuickRange(q.days)}>
            {q.label}
          </button>
        ))}
      </div>
      <div className="att-daterange-inputs">
        <input
          type="date"
          className="att-date-input"
          value={fromDate}
          onChange={e => onFromChange(e.target.value)}
        />
        <ArrowRight size={14} className="att-daterange-arrow" />
        <input
          type="date"
          className="att-date-input"
          value={toDate}
          onChange={e => onToChange(e.target.value)}
        />
        <button
          className="att-search-btn"
          onClick={onApply}
          disabled={!fromDate || !toDate || loading}
        >
          Ko'rish
        </button>
        {isActive && (
          <button className="att-daterange-clear" onClick={onClear}>
            <X size={13} />
            <span>Tozalash</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
