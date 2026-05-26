import React, { useEffect, useRef, useState } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';

const DeptMultiSelect = ({ departments, value = [], onChange, disabled }) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? departments.filter(d => d.name?.toLowerCase().includes(query.toLowerCase()))
    : departments;

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const toggle = (dept) => {
    const id = String(dept.id);
    const exists = value.some(v => String(v) === id);
    if (exists) onChange(value.filter(v => String(v) !== id));
    else        onChange([...value, id]);
  };

  const remove = (e, id) => {
    e.stopPropagation();
    onChange(value.filter(v => String(v) !== String(id)));
  };

  const selectedDepts = departments.filter(d => value.some(v => String(v) === String(d.id)));

  return (
    <div
      ref={wrapRef}
      className={`dms-wrap${open ? ' dms-wrap--open' : ''}${disabled ? ' dms-wrap--disabled' : ''}`}
    >
      <div
        className="dms-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        role="button"
        tabIndex={0}
      >
        <div className="dms-chips">
          {selectedDepts.length === 0 && (
            <span className="dms-placeholder">Bo'lim tanlang (ixtiyoriy)…</span>
          )}
          {selectedDepts.map(dept => (
            <span key={dept.id} className="dms-chip">
              {dept.name}
              <button
                type="button"
                className="dms-chip-remove"
                onClick={e => remove(e, dept.id)}
                disabled={disabled}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown size={14} className={`dms-chevron${open ? ' dms-chevron--up' : ''}`} />
      </div>

      {open && (
        <div className="dms-dropdown">
          <div className="dms-search-wrap">
            <Search size={13} className="dms-search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="dms-search-input"
              placeholder="Qidirish..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="dms-list">
            {filtered.length === 0 && <div className="dms-empty">Topilmadi</div>}
            {filtered.map(dept => {
              const selected = value.some(v => String(v) === String(dept.id));
              return (
                <div
                  key={dept.id}
                  className={`dms-option${selected ? ' dms-option--selected' : ''}`}
                  onClick={() => toggle(dept)}
                  role="option"
                  aria-selected={selected}
                >
                  <span className="dms-option-check">{selected ? '✓' : ''}</span>
                  <span className="dms-option-name">{dept.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptMultiSelect;
