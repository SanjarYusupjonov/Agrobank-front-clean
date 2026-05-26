export function toMin(t) {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + (parts[1] || 0);
}

export function diff(start, end) {
  return Math.max(toMin(end) - toMin(start), 0);
}

export function fmtTime(t) {
  return t ? t.slice(0, 5) : '';
}

export function formatDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}s` : `${h}s ${m}m`;
}

export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return dateStr;
  try {
    const [y, mo, d] = dateStr.split('-');
    const months = ['Yan','Feb','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek'];
    return `${d} ${months[parseInt(mo, 10) - 1]} ${y}`;
  } catch {
    return dateStr;
  }
}

export function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = [];
  const add = (p) => { if (!pages.includes(p)) pages.push(p); };
  [0, 1].forEach(add);
  [current - 1, current, current + 1].forEach(p => { if (p >= 0 && p < total) add(p); });
  [total - 2, total - 1].forEach(add);
  pages.sort((a, b) => a - b);
  const result = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) result.push('…');
    result.push(p);
  });
  return result;
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
