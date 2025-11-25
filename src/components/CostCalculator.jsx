import { useState } from 'react';
import { MODEL_PRICING, calculateAllModelSavings, formatCurrency } from '../services/pricingCalculator';

const VOLUME_OPTIONS = [
  { label: '1K', value: 1000 },
  { label: '10K', value: 10000 },
  { label: '100K', value: 100000 },
  { label: '1M', value: 1000000 },
];

const CostCalculator = ({ tokensSaved }) => {
  const [selectedVolume, setSelectedVolume] = useState(1000);

  if (tokensSaved <= 0) {
    return null;
  }

  const modelSavings = calculateAllModelSavings(tokensSaved);

  const getVolumeMultiplier = () => {
    switch (selectedVolume) {
      case 1000: return 1;
      case 10000: return 10;
      case 100000: return 100;
      case 1000000: return 1000;
      default: return 1;
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Cost Savings
        </h3>

        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
          {VOLUME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedVolume(option.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedVolume === option.value
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {option.label} calls
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {modelSavings.map((model) => {
          const savingsAmount = parseFloat(model.per1KCalls) * getVolumeMultiplier();

          return (
            <div
              key={model.modelId}
              className="bg-slate-800 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: model.color }}
                />
                <span className="text-sm text-slate-300 font-medium">
                  {model.model}
                </span>
              </div>
              <div className="text-xl font-bold text-success">
                {formatCurrency(savingsAmount)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                saved per {selectedVolume.toLocaleString()} calls
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">
            Tokens saved per call:
          </span>
          <span className="text-lg font-semibold text-text-primary">
            {tokensSaved.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          * Savings calculated based on input token pricing. Actual savings may vary based on usage patterns and model selection.
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;
