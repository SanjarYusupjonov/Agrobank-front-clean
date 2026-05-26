import React, { useState, useCallback } from 'react';
import { attendanceAPI } from '../api/api';
import { Calendar, ArrowRight } from 'lucide-react';
import TimelineHeader from '../components/timeline/TimelineHeader';
import TimelineSkeleton from '../components/timeline/TimelineSkeleton';
import DateRow from '../components/timeline/DateRow';
import Pagination from '../components/timeline/Pagination';
import { diff, formatDuration } from '../utils/timeUtils';
import './PageCommon.css';
import './Attendance.css';

const PAGE_SIZE = 10;

function buildGrouped(rows) {
  const byName = {};
  rows.forEach(row => {
    const key = row.name || "Noma'lum";
    if (!byName[key]) byName[key] = { name: key, department: row.department, dateMap: {} };
    const d = row.date || 'N/A';
    if (!byName[key].dateMap[d]) byName[key].dateMap[d] = [];
    byName[key].dateMap[d].push(...(row.intervals || []));
  });
  return Object.values(byName).map(emp => ({
    name: emp.name,
    department: emp.department,
    dates: Object.entries(emp.dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, intervals]) => ({ date, intervals })),
  }));
}

const EmployeeBlock = ({ employee }) => {
  const totalWork = employee.dates
    .flatMap(d => d.intervals)
    .filter(s => s.type === 'work')
    .reduce((a, s) => a + diff(s.start, s.end), 0);

  return (
    <div className="tl-employee-block">
      <div className="tl-employee-header">
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
      </div>
      {employee.dates.map(({ date, intervals }) => (
        <DateRow key={date} date={date} intervals={intervals} />
      ))}
    </div>
  );
};

const QUICK_RANGES = [
  { label: 'Bugun', days: 0 },
  { label: '7 kun', days: 7 },
  { label: '30 kun', days: 30 },
];

const ByDate = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate]     = useState('');
  const [rows, setRows]         = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');

  const fetchPage = useCallback(async (page = 0, from = fromDate, to = toDate) => {
    if (!from || !to) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await attendanceAPI.getTimelineByDateRange({
        fromDate: `${from}T00:00:00`,
        toDate:   `${to}T23:59:59`,
        page,
        size: PAGE_SIZE,
      });
      const p = res.data;
      setRows(p.content || []);
      setPagination({
        page: p.number ?? 0,
        totalPages: p.totalPages ?? 0,
        totalElements: p.totalElements ?? 0,
      });
    } catch {
      setError("Sana bo'yicha qidiruvda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  const handleSearch = () => fetchPage(0);

  const setQuickRange = (days) => {
    const to   = new Date();
    const from = new Date();
    if (days > 0) from.setDate(from.getDate() - days);
    const fmt = (d) => d.toISOString().split('T')[0];
    setFromDate(fmt(from));
    setToDate(fmt(to));
  };

  const grouped = buildGrouped(rows);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-wrap">
          <div className="page-title-icon"><Calendar size={20} /></div>
          <div>
            <h1 className="page-title">Sana bo'yicha filtrlash</h1>
            <p className="page-desc">Berilgan sana oralig'idagi davomatni ko'ring</p>
          </div>
        </div>
        {searched && !loading && (
          <div className="tl-total-badge">
            Jami: <strong>{pagination.totalElements}</strong> qayd
          </div>
        )}
      </div>

      <div className="date-filter-card">
        <div className="quick-ranges">
          <span className="quick-label">Tezkor:</span>
          {QUICK_RANGES.map(q => (
            <button key={q.days} className="quick-btn" onClick={() => setQuickRange(q.days)}>
              {q.label}
            </button>
          ))}
        </div>
        <div className="date-inputs">
          <div className="date-group">
            <label>Boshlanish sanasi</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="date-input"
            />
          </div>
          <ArrowRight size={18} className="date-arrow" />
          <div className="date-group">
            <label>Tugash sanasi</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="date-input"
            />
          </div>
          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={!fromDate || !toDate || loading}
          >
            {loading ? <span className="spinner-sm" /> : "Ko'rish"}
          </button>
        </div>
      </div>

      {error && <div className="page-error">⚠ {error}</div>}

      {!searched ? (
        <div className="search-hint">
          <Calendar size={48} />
          <p>Sana oralig'ini tanlang va "Ko'rish" tugmasini bosing</p>
        </div>
      ) : loading ? (
        <TimelineSkeleton rows={4} />
      ) : grouped.length === 0 ? (
        <div className="table-empty">
          <Calendar size={48} />
          <p>Bu sana oralig'ida ma'lumot topilmadi</p>
        </div>
      ) : (
        <>
          <div className="search-meta" style={{ marginBottom: 12 }}>
            <strong>{fromDate}</strong> dan <strong>{toDate}</strong> gacha &nbsp;·&nbsp;
            {pagination.totalElements} ta qayd
          </div>
          <div className="page-content">
            <div className="timeline-container">
              <TimelineHeader />
              {grouped.map(employee => (
                <EmployeeBlock key={`${employee.name}-${employee.dates[0]?.date}`} employee={employee} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={p => fetchPage(p)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ByDate;
