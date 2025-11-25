import { formatPercentage } from '../utils/formatters';

const TokenComparison = ({ original, jsonTokens, toonTokens }) => {
  const jsonSavings = original > 0 ? ((original - jsonTokens) / original * 100) : 0;
  const toonSavings = original > 0 ? ((original - toonTokens) / original * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Original */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
        <div className="text-sm text-slate-400 mb-1">Original</div>
        <div className="text-2xl font-bold text-text-primary">
          {original.toLocaleString()}
        </div>
        <div className="text-sm text-slate-500">tokens</div>
      </div>

      {/* JSON */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
        <div className="text-sm text-slate-400 mb-1">Optimized JSON</div>
        <div className="text-2xl font-bold text-primary">
          {jsonTokens.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-slate-500">tokens</span>
          {jsonSavings > 0 && (
            <span className="text-sm text-success flex items-center gap-1">
              <ArrowDownIcon className="w-3 h-3" />
              {formatPercentage(jsonSavings)}
            </span>
          )}
        </div>
      </div>

      {/* TOON */}
      <div className={`bg-slate-800 rounded-lg p-4 border ${
        toonSavings > 15 ? 'border-success' : 'border-slate-600'
      }`}>
        <div className="text-sm text-slate-400 mb-1">TOON Format</div>
        <div className={`text-2xl font-bold ${
          toonSavings > 15 ? 'text-success' : 'text-text-primary'
        }`}>
          {toonTokens.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-slate-500">tokens</span>
          {toonSavings > 0 && (
            <span className={`text-sm flex items-center gap-1 ${
              toonSavings > 15 ? 'text-success' : 'text-slate-400'
            }`}>
              <ArrowDownIcon className="w-3 h-3" />
              {formatPercentage(toonSavings)}
            </span>
          )}
          {toonSavings > 15 && (
            <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
              Best
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ArrowDownIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14l-7 7m0 0l-7-7m7 7V3"
    />
  </svg>
);

export default TokenComparison;
