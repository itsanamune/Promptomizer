// Pricing per 1M input tokens (as of Nov 2024)
export const MODEL_PRICING = {
  'gpt-4': {
    name: 'GPT-4',
    inputPer1M: 30.00,
    outputPer1M: 60.00,
    color: '#10A37F',
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    inputPer1M: 10.00,
    outputPer1M: 30.00,
    color: '#10A37F',
  },
  'gpt-4o': {
    name: 'GPT-4o',
    inputPer1M: 2.50,
    outputPer1M: 10.00,
    color: '#10A37F',
  },
  'claude-opus': {
    name: 'Claude Opus 4',
    inputPer1M: 15.00,
    outputPer1M: 75.00,
    color: '#CC785C',
  },
  'claude-sonnet': {
    name: 'Claude Sonnet 4',
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    color: '#CC785C',
  },
  'claude-haiku': {
    name: 'Claude Haiku',
    inputPer1M: 0.25,
    outputPer1M: 1.25,
    color: '#CC785C',
  },
};

export const CALL_VOLUMES = [
  { label: '1K calls', multiplier: 1000 },
  { label: '10K calls', multiplier: 10000 },
  { label: '100K calls', multiplier: 100000 },
  { label: '1M calls', multiplier: 1000000 },
];

export const calculateCostSavings = (tokensSaved, model = 'gpt-4') => {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    return null;
  }

  const costPer1000Tokens = pricing.inputPer1M / 1000;

  return {
    model: pricing.name,
    color: pricing.color,
    perCall: (tokensSaved * costPer1000Tokens / 1000).toFixed(6),
    per1KCalls: (tokensSaved * costPer1000Tokens).toFixed(2),
    per10KCalls: (tokensSaved * costPer1000Tokens * 10).toFixed(2),
    per100KCalls: (tokensSaved * costPer1000Tokens * 100).toFixed(2),
    per1MCalls: (tokensSaved * costPer1000Tokens * 1000).toFixed(2),
  };
};

export const calculateAllModelSavings = (tokensSaved) => {
  return Object.keys(MODEL_PRICING).map((modelId) => ({
    modelId,
    ...calculateCostSavings(tokensSaved, modelId),
  }));
};

export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  if (num >= 1) {
    return `$${num.toFixed(2)}`;
  }
  if (num >= 0.01) {
    return `$${num.toFixed(2)}`;
  }
  return `$${num.toFixed(4)}`;
};

export const calculateTotalMonthlySavings = (tokensSaved, callsPerMonth, model = 'gpt-4') => {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;

  const costPer1000Tokens = pricing.inputPer1M / 1000;
  return (tokensSaved * costPer1000Tokens * callsPerMonth / 1000).toFixed(2);
};
