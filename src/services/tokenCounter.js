import { encodingForModel, getEncoding } from 'js-tiktoken';

// Cache for encodings to avoid recreating them
const encodingCache = new Map();

const getEncoder = (model) => {
  // Map model names to tiktoken encoding names
  const modelToEncoding = {
    'gpt-4': 'cl100k_base',
    'gpt-4-turbo': 'cl100k_base',
    'gpt-4o': 'o200k_base',
    'gpt-3.5-turbo': 'cl100k_base',
    'claude-3': 'cl100k_base', // Claude uses similar tokenization
    'claude-sonnet': 'cl100k_base',
    'claude-opus': 'cl100k_base',
    'default': 'cl100k_base',
  };

  const encodingName = modelToEncoding[model] || modelToEncoding['default'];

  if (!encodingCache.has(encodingName)) {
    try {
      encodingCache.set(encodingName, getEncoding(encodingName));
    } catch {
      // Fallback to cl100k_base if model-specific encoding fails
      encodingCache.set(encodingName, getEncoding('cl100k_base'));
    }
  }

  return encodingCache.get(encodingName);
};

export const countTokens = (text, model = 'gpt-4') => {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  try {
    const encoder = getEncoder(model);
    const tokens = encoder.encode(text);
    return tokens.length;
  } catch (error) {
    // Fallback: estimate based on character count
    // Average English word is ~4.5 characters, average token is ~4 characters
    console.warn('Token counting failed, using estimation:', error);
    return Math.ceil(text.length / 4);
  }
};

export const estimateTokens = (text) => {
  if (!text) return 0;
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

export const calculateTokenSavings = (originalText, optimizedText, model = 'gpt-4') => {
  const originalTokens = countTokens(originalText, model);
  const optimizedTokens = countTokens(optimizedText, model);

  const tokensSaved = originalTokens - optimizedTokens;
  const percentSaved = originalTokens > 0
    ? ((tokensSaved / originalTokens) * 100).toFixed(1)
    : 0;

  return {
    original: originalTokens,
    optimized: optimizedTokens,
    saved: tokensSaved,
    percentSaved: parseFloat(percentSaved),
  };
};

// Debounced token counting for live updates
let debounceTimer = null;
export const debouncedCountTokens = (text, callback, delay = 500) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    const count = countTokens(text, 'gpt-4');
    callback(count);
  }, delay);
};

// Clean up function to free encoding resources
export const cleanupEncodings = () => {
  encodingCache.forEach((encoding) => {
    try {
      encoding.free?.();
    } catch {
      // Ignore cleanup errors
    }
  });
  encodingCache.clear();
};
