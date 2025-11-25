import { useState } from 'react';
import CopyButton from './CopyButton';
import TokenComparison from './TokenComparison';
import CostCalculator from './CostCalculator';
import { syntaxHighlightJSON } from '../utils/formatters';
import { downloadJSON, downloadTOON, downloadReport, generateReport } from '../utils/fileDownload';
import { calculateAllModelSavings } from '../services/pricingCalculator';
import toast from 'react-hot-toast';

const OptimizationResults = ({
  originalPrompt,
  jsonOutput,
  toonOutput,
  originalTokens,
  jsonTokens,
  toonTokens,
  showToon,
}) => {
  const [activeTab, setActiveTab] = useState('json');
  const [showOriginal, setShowOriginal] = useState(false);

  const jsonString = typeof jsonOutput === 'string'
    ? jsonOutput
    : JSON.stringify(jsonOutput, null, 2);

  const tokensSaved = originalTokens - (activeTab === 'toon' && showToon ? toonTokens : jsonTokens);

  const handleDownloadJSON = () => {
    const result = downloadJSON(jsonOutput);
    if (result.success) {
      toast.success('JSON file downloaded');
    } else {
      toast.error('Download failed');
    }
  };

  const handleDownloadTOON = () => {
    const result = downloadTOON(toonOutput);
    if (result.success) {
      toast.success('TOON file downloaded');
    } else {
      toast.error('Download failed');
    }
  };

  const handleDownloadReport = () => {
    const savings = {
      original: originalTokens,
      json: {
        optimized: jsonTokens,
        percentSaved: ((originalTokens - jsonTokens) / originalTokens * 100).toFixed(1),
      },
      toon: showToon ? {
        optimized: toonTokens,
        percentSaved: ((originalTokens - toonTokens) / originalTokens * 100).toFixed(1),
      } : null,
      models: calculateAllModelSavings(originalTokens - jsonTokens),
    };

    const report = generateReport(originalPrompt, jsonOutput, toonOutput, savings);
    const result = downloadReport(report);
    if (result.success) {
      toast.success('Report downloaded');
    } else {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Token Comparison */}
      <div className="bg-surface rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Token Analysis
        </h3>
        <TokenComparison
          original={originalTokens}
          jsonTokens={jsonTokens}
          toonTokens={toonTokens}
        />
      </div>

      {/* Output Tabs */}
      <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden">
        <div className="flex items-center border-b border-slate-700">
          <button
            onClick={() => setShowOriginal(true)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              showOriginal
                ? 'bg-slate-800 text-text-primary border-b-2 border-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => { setShowOriginal(false); setActiveTab('json'); }}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              !showOriginal && activeTab === 'json'
                ? 'bg-slate-800 text-text-primary border-b-2 border-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            JSON
          </button>
          {showToon && (
            <button
              onClick={() => { setShowOriginal(false); setActiveTab('toon'); }}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                !showOriginal && activeTab === 'toon'
                  ? 'bg-slate-800 text-text-primary border-b-2 border-success'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TOON
              <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                Best
              </span>
            </button>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-2 px-4">
            {showOriginal ? (
              <CopyButton text={originalPrompt} label="Copy" variant="ghost" />
            ) : activeTab === 'json' ? (
              <CopyButton text={jsonString} label="Copy JSON" variant="ghost" />
            ) : (
              <CopyButton text={toonOutput} label="Copy TOON" variant="ghost" />
            )}
          </div>
        </div>

        <div className="p-4 max-h-[400px] overflow-auto">
          {showOriginal ? (
            <pre className="code-block text-slate-300 whitespace-pre-wrap">
              {originalPrompt}
            </pre>
          ) : activeTab === 'json' ? (
            <pre
              className="code-block"
              dangerouslySetInnerHTML={{ __html: syntaxHighlightJSON(jsonOutput) }}
            />
          ) : (
            <pre className="code-block text-slate-300">
              {toonOutput}
            </pre>
          )}
        </div>
      </div>

      {/* Cost Calculator */}
      <CostCalculator tokensSaved={tokensSaved > 0 ? tokensSaved : 0} />

      {/* Download Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownloadJSON}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-text-primary transition-colors"
        >
          <DownloadIcon className="w-4 h-4" />
          Download JSON
        </button>

        {showToon && (
          <button
            onClick={handleDownloadTOON}
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-text-primary transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            Download TOON
          </button>
        )}

        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <DownloadIcon className="w-4 h-4" />
          Download Report
        </button>
      </div>
    </div>
  );
};

const DownloadIcon = ({ className }) => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

export default OptimizationResults;
