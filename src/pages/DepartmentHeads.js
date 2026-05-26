import React, { useEffect, useState, useCallback, useRef } from 'react';
import { departmentAPI, departmentHeadsAPI } from '../api/api';
import { Users, Search, X, ChevronLeft, ChevronRight, Building2, Plus, Trash2 } from 'lucide-react';
import DepartmentSearchSelect from '../components/DepartmentSearchSelect';
import AddDeptHeadModal from '../components/AddDeptHeadModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import '../components/DepartmentSearchSelect.css';
import './PageCommon.css';
import './DepartmentHeads.css';

const PAGE_SIZE = 10;
const EMPTY_FORM = { fullName: '', username: '', password: '', confirmPassword: '', departmentIdList: [] };
const COLORS = ['#1eb864','#0a9e55','#14c46a','#0d7a42','#22d874'];

const colorFor = (id) => COLORS[(id || 0) % COLORS.length];

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const getDepts = (head) => {
  if (Array.isArray(head.departments) && head.departments.length > 0) return head.departments;
  if (head.department?.name) return [head.department];
  return [];
};

const DepartmentHeads = () => {
  const [rows, setRows]             = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [departments, setDepartments] = useState([]);
  const [deptId, setDeptId]           = useState('');
  const [queryInput, setQueryInput]   = useState('');
  const [query, setQuery]             = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formErr, setFormErr]         = useState({});
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState('');

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
      const res = await departmentHeadsAPI.getAll({
        page,
        size: PAGE_SIZE,
        query:        query        || undefined,
        departmentId: deptId ? Number(deptId) : undefined,
      });
      const p = res.data;
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
  }, [query, deptId]);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  const handleQueryInput = (val) => {
    setQueryInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val), 250);
  };

  const clearQuery = () => { setQueryInput(''); setQuery(''); };

  const goPage = (p) => {
    if (p < 0 || p >= pagination.totalPages) return;
    fetchPage(p);
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    setFormErr({});
    setSubmitError('');
    setShowPass(false);
    setShowConfirm(false);
    setModalOpen(true);
  };

  const closeModal = () => { if (!submitting) setModalOpen(false); };

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setFormErr(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())         e.fullName        = "To'liq ism kiritilmagan";
    if (!form.username.trim())         e.username        = "Login kiritilmagan";
    if (form.password.length < 4)      e.password        = "Kamida 4 ta belgi bo'lishi kerak";
    if (!form.confirmPassword)         e.confirmPassword = "Parolni tasdiqlang";
    else if (form.password !== form.confirmPassword)
                                       e.confirmPassword = "Parollar mos kelmadi";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setFormErr(e); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      await departmentHeadsAPI.create({
        fullName:         form.fullName.trim(),
        username:         form.username.trim(),
        password:         form.password,
        departmentIdList: form.departmentIdList.map(Number),
      });
      setModalOpen(false);
      fetchPage(0);
    } catch (err) {
      const msg = err.response?.data;
      setSubmitError(typeof msg === 'string' ? msg : "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await departmentHeadsAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchPage(pagination.page);
    } catch (err) {
      const msg = err.response?.data;
      setDeleteError(typeof msg === 'string' ? msg : "O'chirishda xato yuz berdi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-wrap">
          <div className="page-title-icon"><Users size={22} /></div>
          <div>
            <h1 className="page-title">Bo'lim boshliqlari</h1>
            <p className="page-desc">
              {pagination.totalElements > 0
                ? `${pagination.totalElements} ta bo'lim boshlig'i topildi`
                : "Bo'lim boshliqlarini boshqarish"}
            </p>
          </div>
        </div>
        <button className="dh-add-btn" onClick={openModal}>
          <Plus size={16} /><span>Qo'shish</span>
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="dh-filter-bar">
        <div className="dh-search-wrap">
          <Search size={15} className="dh-search-icon" />
          <input
            className="dh-search-input"
            value={queryInput}
            onChange={e => handleQueryInput(e.target.value)}
            placeholder="Ism yoki login bo'yicha qidirish..."
          />
          {queryInput && (
            <button className="dh-clear-btn" onClick={clearQuery}><X size={14} /></button>
          )}
        </div>
        <div className="dh-dept-wrap">
          <DepartmentSearchSelect departments={departments} value={deptId} onChange={setDeptId} />
        </div>
        <span className="result-count">{!loading && `${pagination.totalElements} ta natija`}</span>
      </div>

      <div className="dh-table-wrap">
        {loading ? (
          <div className="dh-loading">
            <div className="spinner-sm" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <span>Yuklanmoqda…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="dh-empty">
            <Users size={40} style={{ opacity: 0.15 }} />
            <p>Ma'lumot topilmadi</p>
          </div>
        ) : (
          <table className="dh-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Xodim</th>
                <th>Login</th>
                <th><Building2 size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Bo'limlar</th>
                <th>Tur</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((head, idx) => (
                <tr key={head.id}>
                  <td className="dh-td-num">{pagination.page * PAGE_SIZE + idx + 1}</td>
                  <td>
                    <div className="dh-person">
                      <div className="dh-avatar" style={{ background: colorFor(head.id) }}>
                        {getInitials(head.fullName || head.userName)}
                      </div>
                      <span className="dh-fullname">{head.fullName}</span>
                    </div>
                  </td>
                  <td><span className="dh-username">@{head.userName}</span></td>
                  <td>
                    <div className="dh-dept-list">
                      {getDepts(head).length > 0
                        ? getDepts(head).map(d => (
                            <span key={d.id} className="dh-dept-badge">{d.name}</span>
                          ))
                        : <span className="dh-none">—</span>
                      }
                    </div>
                  </td>
                  <td>
                    <span className="dh-type-badge">
                      {head.userType ?? head.type ?? 'DEPARTMENT_HEAD'}
                    </span>
                  </td>
                  <td className="dh-td-actions">
                    <button
                      className="dh-delete-btn"
                      onClick={() => { setDeleteTarget({ id: head.id, fullName: head.fullName }); setDeleteError(''); }}
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="dh-pagination">
          <button className="dh-page-btn" disabled={pagination.page === 0} onClick={() => goPage(pagination.page - 1)}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i)
            .filter(i => i === 0 || i === pagination.totalPages - 1 || Math.abs(i - pagination.page) <= 1)
            .reduce((acc, i, idx, arr) => {
              if (idx > 0 && i - arr[idx - 1] > 1) acc.push('...');
              acc.push(i);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '...'
                ? <span key={`e${idx}`} className="dh-page-ellipsis">…</span>
                : <button
                    key={item}
                    className={`dh-page-btn ${item === pagination.page ? 'dh-page-btn--active' : ''}`}
                    onClick={() => goPage(item)}
                  >{item + 1}</button>
            )}
          <button className="dh-page-btn" disabled={pagination.page >= pagination.totalPages - 1} onClick={() => goPage(pagination.page + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <AddDeptHeadModal
        open={modalOpen}
        onClose={closeModal}
        form={form}
        formErr={formErr}
        submitError={submitError}
        submitting={submitting}
        showPass={showPass}
        showConfirm={showConfirm}
        departments={departments}
        onSetField={setField}
        onTogglePass={() => setShowPass(s => !s)}
        onToggleConfirm={() => setShowConfirm(s => !s)}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
        error={deleteError}
      />
    </div>
  );
};

export default DepartmentHeads;
