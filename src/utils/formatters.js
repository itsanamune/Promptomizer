export const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

export const formatPercentage = (value, decimals = 1) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

export const formatCurrency = (amount, decimals = 2) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';

  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  if (num >= 0.01) {
    return `$${num.toFixed(decimals)}`;
  }
  if (num > 0) {
    return `$${num.toFixed(4)}`;
  }
  return '$0.00';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const syntaxHighlightJSON = (json) => {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }

  // Escape HTML
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Apply syntax highlighting
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'token-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'token-key';
          // Remove the colon for the key span
          return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
        } else {
          cls = 'token-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'token-boolean';
      } else if (/null/.test(match)) {
        cls = 'token-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const formatTimestamp = (date = new Date()) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
