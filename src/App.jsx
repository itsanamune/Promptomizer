import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

import PromptInput from './components/PromptInput';
import OptimizationResults from './components/OptimizationResults';
import StatusIndicator from './components/StatusIndicator';
import ToastContainer from './components/Toast';

import { analyzePrompt } from './services/lmStudioService';
import { convertToTOON, formatJSON } from './services/toonConverter';
import { countTokens } from './services/tokenCounter';

const TOON_SAVINGS_THRESHOLD = 15; // Only show TOON if it saves > 15%

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
  }, []);

  const handleOptimize = async (prompt) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Analyze prompt with LM Studio
      const analysisResult = await analyzePrompt(prompt);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Failed to analyze prompt');
      }

      const jsonData = analysisResult.data;
      const jsonString = formatJSON(jsonData);

      // Count tokens
      const originalTokens = countTokens(prompt, 'gpt-4');
      const jsonTokens = countTokens(jsonString, 'gpt-4');

      // Convert to TOON
      const toonResult = convertToTOON(jsonData);
      let toonOutput = null;
      let toonTokens = 0;
      let showToon = false;

      if (toonResult.success && toonResult.data) {
        toonOutput = toonResult.data;
        toonTokens = countTokens(toonOutput, 'gpt-4');

        // Check if TOON saves > threshold
        const toonSavingsPercent = ((originalTokens - toonTokens) / originalTokens) * 100;
        showToon = toonSavingsPercent > TOON_SAVINGS_THRESHOLD;
      }

      setResults({
        originalPrompt: prompt,
        jsonOutput: jsonData,
        toonOutput,
        originalTokens,
        jsonTokens,
        toonTokens,
        showToon,
      });

      toast.success('Prompt optimized successfully!');
    } catch (err) {
      console.error('Optimization error:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'Optimization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary">
                PromptOptimizer
              </h1>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Beta
              </span>
            </div>
            <StatusIndicator onConnectionChange={handleConnectionChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Description */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-slate-400">
              Paste your natural language prompt and convert it to token-optimized
              structured formats. Save 30-60% on LLM API costs.
            </p>
          </div>

          {/* Connection Warning */}
          {!isConnected && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h4 className="text-yellow-500 font-medium">
                    LM Studio not connected
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Please start LM Studio and enable the local server on{' '}
                    <code className="bg-slate-800 px-1 rounded">127.0.0.1:1234</code>.
                    The app requires a local LLM to extract structured data.
                  </p>
                  <a
                    href="https://lmstudio.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                  >
                    Download LM Studio
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <PromptInput
            onOptimize={handleOptimize}
            isProcessing={isProcessing}
            disabled={!isConnected}
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-red-500 font-medium">Optimization Error</h4>
                  <p className="text-sm text-slate-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <OptimizationResults
              originalPrompt={results.originalPrompt}
              jsonOutput={results.jsonOutput}
              toonOutput={results.toonOutput}
              originalTokens={results.originalTokens}
              jsonTokens={results.jsonTokens}
              toonTokens={results.toonTokens}
              showToon={results.showToon}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              Powered by local LLMs via{' '}
              <a
                href="https://lmstudio.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                LM Studio
              </a>
            </p>
            <div className="flex items-center gap-4">
              <span>
                JSON →{' '}
                <a
                  href="https://github.com/toon-format/toon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  TOON
                </a>{' '}
                conversion
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default App;
