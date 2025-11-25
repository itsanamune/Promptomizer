import { useState, useEffect, useRef } from 'react';
import { countTokens, estimateTokens } from '../services/tokenCounter';
import { readFileAsText } from '../utils/fileDownload';
import { debounce } from '../utils/formatters';

const MAX_SIZE = 100 * 1024; // 100KB

const PromptInput = ({ onOptimize, isProcessing, disabled }) => {
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Debounced token counting
  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      const count = prompt.length > 0 ? countTokens(prompt, 'gpt-4') : 0;
      setTokenCount(count);
    }, 500);

    setCharCount(prompt.length);
    // Show estimate immediately for responsiveness
    setTokenCount(estimateTokens(prompt));
    debouncedUpdate();

    return () => {};
  }, [prompt]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_SIZE) {
      setPrompt(value);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert('File too large. Maximum size is 100KB.');
      return;
    }

    if (!file.name.match(/\.(txt|md)$/i)) {
      alert('Please upload a .txt or .md file.');
      return;
    }

    try {
      const content = await readFileAsText(file);
      setPrompt(content);
    } catch (error) {
      alert('Failed to read file.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOptimize = () => {
    if (prompt.trim() && !isProcessing) {
      onOptimize(prompt);
    }
  };

  const handleClear = () => {
    setPrompt('');
    textareaRef.current?.focus();
  };

  const handlePaste = () => {
    textareaRef.current?.focus();
    navigator.clipboard.readText().then((text) => {
      if (text.length <= MAX_SIZE) {
        setPrompt(text);
      }
    });
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Paste your prompt below:
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePaste}
            className="text-sm text-slate-400 hover:text-primary transition-colors"
          >
            Paste from clipboard
          </button>
          <span className="text-slate-600">|</span>
          <label className="text-sm text-slate-400 hover:text-primary transition-colors cursor-pointer">
            Upload file
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleInputChange}
          placeholder="Enter your natural language prompt here...

Example:
'I need you to analyze customer feedback. Here are the categories: positive, negative, neutral. The feedback types are: product quality, shipping speed, customer service, pricing. Rate each on a scale of 1-5. Also track the customer name, date, and any specific products mentioned.'"
          className="w-full min-h-[200px] max-h-[400px] p-4 bg-slate-800 border border-slate-600 rounded-lg
                     text-text-primary placeholder-slate-500 resize-y
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     font-mono text-sm leading-relaxed"
          disabled={isProcessing || disabled}
        />

        {prompt && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear prompt"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            {charCount.toLocaleString()} characters
          </span>
          <span className="text-slate-600">|</span>
          <span>
            ~{tokenCount.toLocaleString()} tokens (GPT-4)
          </span>
        </div>

        {charCount > MAX_SIZE * 0.9 && (
          <span className="text-xs text-warning">
            Approaching size limit
          </span>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleOptimize}
          disabled={!prompt.trim() || isProcessing || disabled}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-lg
            transition-all transform
            ${
              !prompt.trim() || isProcessing || disabled
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-primary hover:bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-primary/25'
            }
          `}
        >
          {isProcessing ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <span>Optimize Prompt</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;
