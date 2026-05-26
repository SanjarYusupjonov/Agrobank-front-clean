import React from 'react';
import { useNavigate } from 'react-router-dom';
import { diff, formatDuration } from '../../utils/timeUtils';
import DateRow from './DateRow';

const EmployeeBlock = ({ employee }) => {
  const navigate = useNavigate();

  const totalWork = employee.dates
    .flatMap(d => d.intervals)
    .filter(s => s.type === 'work')
    .reduce((a, s) => a + diff(s.start, s.end), 0);

  const handleClick = () => {
    navigate(
      `/employee/${encodeURIComponent(employee.name)}/${encodeURIComponent(employee.department || '')}`
    );
  };

  return (
    <div className="tl-employee-block">
      <div
        className="tl-employee-header tl-employee-header--clickable"
        onClick={handleClick}
        title="Batafsil ko'rish"
      >
        <div className="tl-avatar">{employee.name.charAt(0).toUpperCase()}</div>
        <div className="tl-name-info">
          <span className="tl-name">{employee.name}</span>
          <span className="tl-summary">
            {employee.department && (
              <span className="tl-dept-badge">{employee.department}</span>
            )}
            <span className="tl-dot tl-dot--work" />
            {formatDuration(totalWork)} ish
            &nbsp;·&nbsp;
            {employee.dates.length} kun
          </span>
        </div>
        <span className="tl-chevron-hint">›</span>
      </div>
      {employee.dates.map(({ date, intervals }) => (
        <DateRow key={date} date={date} intervals={intervals} />
      ))}
    </div>
  );
};

export default EmployeeBlock;
