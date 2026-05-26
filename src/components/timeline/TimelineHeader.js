import React from 'react';

const TimelineHeader = () => (
  <div className="tl-header-row">
    <div className="tl-name-col" />
    <div className="tl-bar-col">
      <div className="tl-hour-labels">
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="tl-hour-label" style={{ left: `${(i / 24) * 100}%` }}>
            {i % 6 === 0 ? `${String(i).padStart(2, '0')}:00`
              : i % 3 === 0 ? `${String(i).padStart(2, '0')}` : ''}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TimelineHeader;
