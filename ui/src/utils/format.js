const VALUE_FORMAT_MAP = [
  { threshold: 1_000_000_000_000, suffix: 'T' },
  { threshold: 1_000_000_000, suffix: 'B' },
  { threshold: 1_000_000, suffix: 'M' },
  { threshold: 1_000, suffix: 'K' },
];

export function formatValue(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  if (value === Infinity) {
    return '∞';
  }

  const absValue = Math.abs(value);

  for (const { threshold, suffix } of VALUE_FORMAT_MAP) {
    if (absValue >= threshold) {
      const formatted = (value / threshold).toFixed(2);
      return formatted.replace(/\.00$/, '').replace(/\.$/, '') + suffix;
    }
  }

  const formatted = value.toFixed(2);
  return formatted.replace(/\.00$/, '').replace(/\.$/, '');
}

export function formatPercentage(value, showSign = false) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  if (value === Infinity) {
    return showSign ? '+∞' : '∞';
  }

  const sign = showSign && value > 0 ? '+' : '';

  if (value > 0 && value < 0.01 && !showSign) {
    return '<.01%';
  }

  const formatted = value.toFixed(2).replace(/\.00$/, '').replace(/\.$/, '');
  return `${sign}${formatted}%`;
}

export function formatPrice(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  return value.toLocaleString('en-US');
}
