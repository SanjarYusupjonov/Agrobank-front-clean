import React from 'react';
import { Users, X, Plus, Eye, EyeOff } from 'lucide-react';
import DeptMultiSelect from './DeptMultiSelect';

const AddDeptHeadModal = ({
  open,
  onClose,
  form,
  formErr,
  submitError,
  submitting,
  showPass,
  showConfirm,
  departments,
  onSetField,
  onTogglePass,
  onToggleConfirm,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <div className="dh-modal-overlay" onClick={onClose}>
      <div className="dh-modal" onClick={e => e.stopPropagation()}>
        <div className="dh-modal-header">
          <div className="dh-modal-title-wrap">
            <div className="dh-modal-icon"><Users size={18} /></div>
            <span className="dh-modal-title">Yangi bo'lim boshlig'i</span>
          </div>
          <button className="dh-modal-close" onClick={onClose} disabled={submitting}>
            <X size={18} />
          </button>
        </div>

        <div className="dh-modal-body">
          {submitError && <div className="dh-modal-error">{submitError}</div>}

          <div className="dh-field">
            <label className="dh-label">To'liq ism <span className="dh-req">*</span></label>
            <input
              className={`dh-input ${formErr.fullName ? 'dh-input--err' : ''}`}
              value={form.fullName}
              onChange={e => onSetField('fullName', e.target.value)}
              placeholder="Abdullayev Abdulla"
              disabled={submitting}
            />
            {formErr.fullName && <span className="dh-field-err">{formErr.fullName}</span>}
          </div>

          <div className="dh-field">
            <label className="dh-label">Login <span className="dh-req">*</span></label>
            <input
              className={`dh-input ${formErr.username ? 'dh-input--err' : ''}`}
              value={form.username}
              onChange={e => onSetField('username', e.target.value)}
              placeholder="abdullayev"
              autoComplete="off"
              disabled={submitting}
            />
            {formErr.username && <span className="dh-field-err">{formErr.username}</span>}
          </div>

          <div className="dh-field">
            <label className="dh-label">Parol <span className="dh-req">*</span></label>
            <div className="dh-input-wrap">
              <input
                className={`dh-input dh-input--icon-right ${formErr.password ? 'dh-input--err' : ''}`}
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => onSetField('password', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={submitting}
              />
              <button className="dh-pass-toggle" type="button" onClick={onTogglePass} disabled={submitting}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {formErr.password && <span className="dh-field-err">{formErr.password}</span>}
          </div>

          <div className="dh-field">
            <label className="dh-label">Parolni tasdiqlang <span className="dh-req">*</span></label>
            <div className="dh-input-wrap">
              <input
                className={`dh-input dh-input--icon-right ${
                  formErr.confirmPassword ? 'dh-input--err'
                    : form.confirmPassword && form.password === form.confirmPassword ? 'dh-input--ok' : ''
                }`}
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => onSetField('confirmPassword', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={submitting}
              />
              <button className="dh-pass-toggle" type="button" onClick={onToggleConfirm} disabled={submitting}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {formErr.confirmPassword
              ? <span className="dh-field-err">{formErr.confirmPassword}</span>
              : form.confirmPassword && form.password === form.confirmPassword
                ? <span className="dh-field-ok">✓ Parollar mos keldi</span>
                : null
            }
          </div>

          <div className="dh-field">
            <label className="dh-label">
              Bo'limlar{' '}
              <span className="dh-label-opt">
                (ixtiyoriy{form.departmentIdList.length > 0 ? ` · ${form.departmentIdList.length} ta tanlangan` : ''})
              </span>
            </label>
            <DeptMultiSelect
              departments={departments}
              value={form.departmentIdList}
              onChange={val => onSetField('departmentIdList', val)}
              disabled={submitting}
            />
          </div>

          <div className="dh-field">
            <label className="dh-label">Tur</label>
            <div className="dh-type-readonly">
              <span className="dh-type-badge">DEPARTMENT_HEAD</span>
              <span className="dh-type-note">avtomatik belgilanadi</span>
            </div>
          </div>
        </div>

        <div className="dh-modal-footer">
          <button className="dh-cancel-btn" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </button>
          <button className="dh-submit-btn" onClick={onSubmit} disabled={submitting}>
            {submitting
              ? <><div className="spinner-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saqlanmoqda…</>
              : <><Plus size={15} /> Qo'shish</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDeptHeadModal;
