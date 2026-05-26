import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildPageNumbers } from '../../utils/timeUtils';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = buildPageNumbers(page, totalPages);
  return (
    <div className="tl-pagination">
      <button className="tl-page-btn tl-page-nav" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="tl-page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`tl-page-btn ${p === page ? 'tl-page-btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        )
      )}
      <button className="tl-page-btn tl-page-nav" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
