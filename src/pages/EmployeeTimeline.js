import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../api/api';
import { ArrowLeft, X, Clock, Coffee, User, Building2, TrendingUp, Download } from 'lucide-react';
import TimelineHeader from '../components/timeline/TimelineHeader';
import DateRangeFilter from '../components/timeline/DateRangeFilter';
import { toMin, formatDate, formatDuration, fmtTime, downloadBlob } from '../utils/timeUtils';
import './PageCommon.css';
import './EmployeeTimeline.css';

const DateBlock = ({ dateResponse }) => {
  const { date, intervalsResponses = [] } = dateResponse;
  const [tooltip, setTooltip] = useState(null);

  const segments = intervalsResponses
    .filter(iv => iv != null)
    .map(iv => {
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

const EtSkeleton = () => (
  <div className="timeline-container">
    <TimelineHeader />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="tl-date-row">
        <div className="tl-date-label-col">
          <div className="skeleton" style={{ width: 90, height: 28, borderRadius: 8 }} />
        </div>
        <div className="tl-bar-col">
          <div className="tl-track">
            <div className="skeleton" style={{ position: 'absolute', left: `${10 + i * 5}%`, width: `${25 + i * 8}%`, height: '100%', borderRadius: 6 }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

function calcStats(data) {
  if (!data) return { totalWork: 0, totalBreak: 0, totalDays: 0 };
  let totalWork = 0, totalBreak = 0;
  (data.dateResponses || []).forEach(dr => {
    (dr.intervalsResponses || [])
      .filter(iv => iv != null)
      .forEach(iv => {
        const min = toMin(iv.end) - toMin(iv.start);
        if (iv.type === 'work')       totalWork  += min;
        else if (iv.type === 'break') totalBreak += min;
      });
  });
  return { totalWork, totalBreak, totalDays: (data.dateResponses || []).length };
}

const EmployeeTimeline = () => {
  const { employeeName, departmentName } = useParams();
  const navigate = useNavigate();

  const name = decodeURIComponent(employeeName || '');
  const dept = decodeURIComponent(departmentName || '');

  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError]       = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate]     = useState('');
  const [activeFrom, setActiveFrom] = useState('');
  const [activeTo, setActiveTo]     = useState('');

  const fetchData = useCallback(async () => {
    if (!name || !dept) return;
    setLoading(true);
    setError('');
    try {
      const params = { employeeName: name, departmentName: dept };
      if (activeFrom && activeTo) {
        params.fromDate = `${activeFrom}T00:00:00`;
        params.toDate   = `${activeTo}T23:59:59`;
      }
      const res     = await attendanceAPI.getTimelineByEmployee(params);
      const content = res.data?.content || [];
      setData(content[0] || null);
    } catch {
      setError("Ma'lumot yuklashda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [name, dept, activeFrom, activeTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyDateRange = () => {
    if (!fromDate || !toDate) return;
    setActiveFrom(fromDate);
    setActiveTo(toDate);
  };

  const clearDateRange = () => {
    setFromDate(''); setToDate('');
    setActiveFrom(''); setActiveTo('');
  };

  const setQuickRange = (days) => {
    const to   = new Date();
    const from = new Date();
    if (days > 0) from.setDate(from.getDate() - days);
    const fmt = (d) => d.toISOString().split('T')[0];
    const f = fmt(from), t = fmt(to);
    setFromDate(f); setToDate(t);
    setActiveFrom(f); setActiveTo(t);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { employeeName: name, departmentName: dept };
      if (activeFrom && activeTo) {
        params.fromDate = `${activeFrom}T00:00:00`;
        params.toDate   = `${activeTo}T23:59:59`;
      }
      const res = await attendanceAPI.exportEmployeeTimeline(params);
      downloadBlob(new Blob([res.data]), `${name}.xlsx`);
    } catch {
      alert('Export xatosi yuz berdi.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const params = { employeeName: name, departmentName: dept };
      if (activeFrom && activeTo) {
        params.fromDate       = `${activeFrom}T00:00:00`;
        params.toDate         = `${activeTo}T23:59:59`;
        params.dateRangeLabel = `${activeFrom} → ${activeTo}`;
      }
      const res = await attendanceAPI.exportEmployeeTimelinePdf(params);
      downloadBlob(new Blob([res.data], { type: 'application/pdf' }), `${name}.pdf`);
    } catch {
      alert('PDF export xatosi yuz berdi.');
    } finally {
      setExportingPdf(false);
    }
  };

  const isDateRangeActive = !!(activeFrom && activeTo);
  const stats = calcStats(data);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-wrap">
          <button className="et-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <div className="et-avatar-lg">{name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="page-title">{name}</h1>
            <p className="page-desc">
              <Building2 size={12} style={{ display: 'inline', marginRight: 5 }} />
              {dept}
            </p>
          </div>
        </div>
        {!loading && data && (
          <div className="et-stats-badges">
            <div className="et-stat-badge">
              <Clock size={13} />
              <span>Jami ish: <strong>{formatDuration(stats.totalWork)}</strong></span>
            </div>
            <div className="et-stat-badge et-stat-badge--break">
              <Coffee size={13} />
              <span>Tanaffus: <strong>{formatDuration(stats.totalBreak)}</strong></span>
            </div>
            <div className="et-stat-badge et-stat-badge--days">
              <TrendingUp size={13} />
              <span><strong>{stats.totalDays}</strong> kun</span>
            </div>
            <button className="export-btn" onClick={handleExport} disabled={loading || exporting}>
              <Download size={14} />
              {exporting ? 'Yuklanmoqda...' : 'Excel'}
            </button>
            <button className="export-btn export-btn--pdf" onClick={handleExportPdf} disabled={loading || exportingPdf}>
              <Download size={14} />
              {exportingPdf ? 'Yuklanmoqda...' : 'PDF'}
            </button>
          </div>
        )}
      </div>

      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        activeFrom={activeFrom}
        activeTo={activeTo}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onApply={applyDateRange}
        onClear={clearDateRange}
        onQuickRange={setQuickRange}
        loading={loading}
      />

      {isDateRangeActive && (
        <div className="att-active-filters">
          <span className="att-filter-chip">
            Oraliq: <strong>{activeFrom} → {activeTo}</strong>
            <button onClick={clearDateRange}><X size={11} /></button>
          </span>
        </div>
      )}

      {error && <div className="page-error">⚠ {error}</div>}

      <div className="page-content">
        {loading ? (
          <EtSkeleton />
        ) : !data ? (
          <div className="table-empty">
            <User size={48} />
            <p>Ma'lumot topilmadi</p>
          </div>
        ) : (
          <div className="timeline-container">
            <TimelineHeader />
            {(data.dateResponses || [])
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(dr => (
                <DateBlock key={dr.date} dateResponse={dr} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTimeline;
