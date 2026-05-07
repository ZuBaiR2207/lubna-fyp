/** Malaysian primary school levels (Primary 1 – Primary 5) */
const MIN = 1;
const MAX = 5;

const labels = {
  1: 'Class 1',
  2: 'Class 2',
  3: 'Class 3',
  4: 'Class 4',
  5: 'Class 5'
};

function normalizeLevel(value) {
  if (value == null || value === '') return null;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < MIN || n > MAX) return null;
  return n;
}

function labelFor(level) {
  if (level == null || level === '') return '—';
  const n = Number(level);
  return labels[n] || '—';
}

function options() {
  return Object.entries(labels).map(([value, label]) => ({ value: Number(value), label }));
}

module.exports = {
  MIN,
  MAX,
  labels,
  labelFor,
  options,
  normalizeLevel
};
