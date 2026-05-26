import React, { useEffect, useState, useCallback, useRef } from 'react';
import { attendanceAPI, departmentAPI } from '../api/api';
import { ClipboardList, Filter, Search, X, Calendar, Download } from 'lucide-react';
import DepartmentSearchSelect from '../components/DepartmentSearchSelect';
import DateRangeFilter from '../components/timeline/DateRangeFilter';
import TimelineHeader from '../components/timeline/TimelineHeader';
import TimelineSkeleton from '../components/timeline/TimelineSkeleton';
import EmployeeBlock from '../components/timeline/EmployeeBlock';
import Pagination from '../components/timeline/Pagination';
import { downloadBlob, formatDate } from '../utils/timeUtils';
import '../components/DepartmentSearchSelect.css';
import './PageCommon.css';
import './Attendance.css';

const PAGE_SIZE = 10;

function buildGrouped(rows) {
  return rows.map(row => ({
    name: row.name || "Noma'lum",
    department: row.department,
    dates: [{ date: row.date || 'N/A', intervals: row.intervals || [] }],
  }));
}

const Attendance = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isDeptHead  = currentUser.userType === 'DEPARTMENT_HEAD';

  const [rows, setRows]             = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading]       = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError]           = useState('');
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId]         = useState('');
  const [nameInput, setNameInput]   = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [fromDate, setFromDate]     = useState('');
  const [toDate, setToDate]         = useState('');
  const [activeFrom, setActiveFrom] = useState('');
  const [activeTo, setActiveTo]     = useState('');

  const debounceRef = useRef(null);

  useEffect(() => {
    departmentAPI.getAll()
      .then(res => setDepartments(res.data || []))
      .catch(() => {});
  }, []);

  const fetchPage = useCallback(async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, size: PAGE_SIZE };
      if (deptId)                 params.departmentId = Number(deptId);
      if (nameFilter)             params.name         = nameFilter;
      if (dateFilter)             params.date         = dateFilter;
      if (activeFrom && activeTo) {
        params.fromDate = `${activeFrom}T00:00:00`;
        params.toDate   = `${activeTo}T23:59:59`;
      }
      const res = await attendanceAPI.getTimeline(params);
      const p   = res.data;
      setRows(p.content || []);
      setPagination({
        page:          p.number        ?? 0,
        totalPages:    p.totalPages    ?? 0,
        totalElements: p.totalElements ?? 0,
      });
    } catch {
      setError("Ma'lumot yuklashda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [deptId, nameFilter, dateFilter, activeFrom, activeTo]);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  const handleNameInput = (val) => {
    setNameInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setNameFilter(val), 200);
  };

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

  const buildExportParams = () => {
    const params = {};
    if (deptId)                 params.departmentId = Number(deptId);
    if (nameFilter)             params.name         = nameFilter;
    if (dateFilter)             params.date         = dateFilter;
    if (activeFrom && activeTo) {
      params.fromDate = `${activeFrom}T00:00:00`;
      params.toDate   = `${activeTo}T23:59:59`;
    }
    return params;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await attendanceAPI.exportTimeline(buildExportParams());
      downloadBlob(new Blob([res.data]), 'davomat.xlsx');
    } catch {
      alert('Export xatosi yuz berdi.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const params = buildExportParams();
      if (activeFrom && activeTo) params.dateRangeLabel = `${activeFrom} → ${activeTo}`;
      if (deptName) params.departmentName = deptName;
      const res = await attendanceAPI.exportTimelinePdf(params);
      downloadBlob(new Blob([res.data], { type: 'application/pdf' }), 'davomat.pdf');
    } catch {
      alert('PDF export xatosi yuz berdi.');
    } finally {
      setExportingPdf(false);
    }
  };

  const hasAnyFilter = !!(deptId || nameFilter || dateFilter || (activeFrom && activeTo));

  const clearAll = () => {
    if (!isDeptHead) setDeptId('');
    setNameInput(''); setNameFilter('');
    setDateFilter('');
    setFromDate(''); setToDate('');
    setActiveFrom(''); setActiveTo('');
  };

  const isDateRangeActive = !!(activeFrom && activeTo);
  const deptName = departments.find(d => String(d.id) === String(deptId))?.name || '';
  const grouped  = buildGrouped(rows);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-wrap">
          <div className="page-title-icon"><ClipboardList size={20} /></div>
          <div>
            <h1 className="page-title">Barcha Davomat</h1>
            <p className="page-desc">Hodimlar kunlik ish vaqti diagrammasi</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="tl-total-badge">
            Jami: <strong>{pagination.totalElements}</strong> qayd
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
      </div>

      <div className="att-filter-bar">
        {!isDeptHead && (
          <div className="filter-item">
            <Filter size={14} />
            <span>Bo'lim:</span>
            <DepartmentSearchSelect value={deptId} onChange={setDeptId} />
          </div>
        )}

        <div className="filter-item att-name-filter">
          <Search size={14} />
          <span>Ism:</span>
          <div className="att-name-input-wrap">
            <input
              type="text"
              className="att-name-input"
              placeholder="Hodim ismi..."
              value={nameInput}
              onChange={e => handleNameInput(e.target.value)}
            />
            {nameInput && (
              <button className="att-name-clear" onClick={() => { setNameInput(''); setNameFilter(''); }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="filter-item">
          <Calendar size={14} />
          <span>Sana:</span>
          <input
            type="date"
            className="att-date-input"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button
              className="att-name-clear"
              style={{ position: 'static', marginLeft: -4 }}
              onClick={() => setDateFilter('')}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="result-count">
          {!loading && (
            <span>{pagination.totalElements} ta qayd &nbsp;·&nbsp; {pagination.totalPages} sahifa</span>
          )}
          {hasAnyFilter && (
            <button className="att-daterange-clear" style={{ marginLeft: 8 }} onClick={clearAll} title="Barcha filterlarni tozalash">
              <X size={13} />
              <span>Tozalash</span>
            </button>
          )}
        </div>
      </div>

      {hasAnyFilter && (
        <div className="att-active-filters">
          {deptId && !isDeptHead && (
            <span className="att-filter-chip">
              Bo'lim: <strong>{deptName}</strong>
              <button onClick={() => setDeptId('')}><X size={11} /></button>
            </span>
          )}
          {nameFilter && (
            <span className="att-filter-chip">
              Ism: <strong>{nameFilter}</strong>
              <button onClick={() => { setNameInput(''); setNameFilter(''); }}><X size={11} /></button>
            </span>
          )}
          {dateFilter && (
            <span className="att-filter-chip">
              Sana: <strong>{formatDate(dateFilter)}</strong>
              <button onClick={() => setDateFilter('')}><X size={11} /></button>
            </span>
          )}
          {isDateRangeActive && (
            <span className="att-filter-chip">
              Oraliq: <strong>{activeFrom} → {activeTo}</strong>
              <button onClick={clearDateRange}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

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

      {error && <div className="page-error">⚠ {error}</div>}

      <div className="page-content">
        {loading ? (
          <TimelineSkeleton />
        ) : grouped.length === 0 ? (
          <div className="table-empty">
            <ClipboardList size={48} />
            <p>Ma'lumot topilmadi</p>
          </div>
        ) : (
          <>
            <div className="timeline-container">
              <TimelineHeader />
              {grouped.map((employee, idx) => (
                <EmployeeBlock key={`${employee.name}-${employee.dates[0]?.date}-${idx}`} employee={employee} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={p => fetchPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;
