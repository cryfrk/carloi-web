export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function formatDateTime(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
