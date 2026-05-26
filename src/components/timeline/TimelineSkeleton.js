import React from 'react';
import TimelineHeader from './TimelineHeader';

const TimelineSkeleton = ({ rows = 5, datesPerRow = 2 }) => (
  <div className="timeline-container">
    <TimelineHeader />
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="tl-employee-block">
        <div className="tl-employee-header">
          <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ width: 120 + i * 12, height: 13, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4 }} />
          </div>
        </div>
        {[...Array(datesPerRow)].map((_, j) => (
          <div key={j} className="tl-date-row">
            <div className="tl-date-label-col">
              <div className="skeleton" style={{ width: 90, height: 28, borderRadius: 8 }} />
            </div>
            <div className="tl-bar-col">
              <div className="tl-track">
                <div className="skeleton" style={{ position: 'absolute', left: `${10 + j * 8}%`, width: `${30 + j * 10}%`, height: '100%', borderRadius: 6 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default TimelineSkeleton;
