import React from 'react';
import { Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ target, onClose, onConfirm, deleting, error }) => {
  if (!target) return null;

  return (
    <div className="dh-modal-overlay" onClick={() => { if (!deleting) onClose(); }}>
      <div className="dh-modal dh-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="dh-modal-header">
          <div className="dh-modal-title-wrap">
            <div className="dh-modal-icon dh-modal-icon--danger"><Trash2 size={18} /></div>
            <span className="dh-modal-title">O'chirishni tasdiqlang</span>
          </div>
          <button className="dh-modal-close" onClick={onClose} disabled={deleting}>
            <X size={18} />
          </button>
        </div>
        <div className="dh-modal-body">
          {error && <div className="dh-modal-error">{error}</div>}
          <p className="dh-confirm-text">
            <strong>{target.fullName}</strong> bo'lim boshlig'ini o'chirmoqchimisiz?
            Bu amalni qaytarib bo'lmaydi.
          </p>
        </div>
        <div className="dh-modal-footer">
          <button className="dh-cancel-btn" onClick={onClose} disabled={deleting}>
            Bekor qilish
          </button>
          <button className="dh-danger-btn" onClick={onConfirm} disabled={deleting}>
            {deleting
              ? <><div className="spinner-sm" style={{ width: 14, height: 14, borderWidth: 2 }} /> O'chirilmoqda…</>
              : <><Trash2 size={14} /> O'chirish</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
