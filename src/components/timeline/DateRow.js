import React, { useState } from 'react';
import { toMin, formatDate, formatDuration, fmtTime } from '../../utils/timeUtils';

const DateRow = ({ date, intervals }) => {
  const [tooltip, setTooltip] = useState(null);

  const segments = intervals.filter(iv => iv.type !== 'lunch').map(iv => {
    const startMin = toMin(iv.start);
    const endMin   = toMin(iv.end);
    return {
      left:     (startMin / 1440) * 100,
      width:    Math.max(((endMin - startMin) / 1440) * 100, 0.3),
      type:     iv.type,
      start:    iv.start,
      end:      iv.end,
      duration: endMin - startMin,
    };
  });

  const workMin  = segments.filter(s => s.type === 'work').reduce((a, s) => a + s.duration, 0);
  const breakMin = segments.filter(s => s.type === 'break').reduce((a, s) => a + s.duration, 0);

  return (
    <div className="tl-date-row">
      <div className="tl-date-label-col">
        <div className="tl-date-chip">
          <span className="tl-date-text">{formatDate(date)}</span>
          <span className="tl-date-durations">
            <span className="tl-dot tl-dot--work" />{formatDuration(workMin)}
            {breakMin > 0 && <><span className="tl-dot tl-dot--break" />{formatDuration(breakMin)}</>}
          </span>
        </div>
      </div>
      <div className="tl-bar-col">
        <div className="tl-track">
          {Array.from({ length: 25 }, (_, i) => (
            <div key={i} className="tl-gridline" style={{ left: `${(i / 24) * 100}%` }} />
          ))}
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className={`tl-segment tl-segment--${seg.type}`}
              style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
              onMouseEnter={e => setTooltip({ seg, x: e.clientX, y: e.clientY })}
              onMouseMove={e => setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </div>
        {tooltip && (
          <div
            className="tl-tooltip"
            style={{ position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 58, pointerEvents: 'none', zIndex: 9999 }}
          >
            <div className="tl-tooltip-row">
              <span className={`tl-dot tl-dot--${tooltip.seg.type}`} />
              <strong>{tooltip.seg.type === 'work' ? 'Ish vaqti' : 'Tanaffus'}</strong>
            </div>
            <span className="tl-tooltip-time">{fmtTime(tooltip.seg.start)} – {fmtTime(tooltip.seg.end)}</span>
            <span className="tl-tooltip-dur">{formatDuration(tooltip.seg.duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRow;
