# PromptOptimizer

A web application that converts natural language prompts to token-optimized structured formats (JSON and TOON), helping AI developers reduce LLM API costs by 30-60%.

## Features

- **Prompt Analysis**: Paste your messy prompts and automatically extract structured data
- **Local LLM Processing**: Uses LM Studio for zero API cost optimization
- **Multiple Output Formats**: JSON and TOON format support
- **Token Counting**: Accurate token counts using GPT-4 tokenization
- **Cost Calculator**: See savings across multiple models (GPT-4, Claude, etc.)
- **Export Options**: Copy to clipboard or download files

## Prerequisites

1. Download and install [LM Studio](https://lmstudio.ai)
2. In LM Studio, download one of these models:
   - NousResearch/Hermes-2-Pro-Mistral-7B (recommended)
   - mistralai/Mistral-7B-Instruct-v0.2
3. Start the local server:
   - Go to Developer tab in LM Studio
   - Click "Start Server"
   - Keep LM Studio running on `127.0.0.1:1234`

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Token Counting**: js-tiktoken
- **JSON to TOON**: @toon-format/toon
- **Notifications**: react-hot-toast
- **LLM**: LM Studio (local, OpenAI-compatible API)

## How It Works

1. Paste your natural language prompt
2. Click "Optimize Prompt"
3. The app sends your prompt to LM Studio for structured extraction
4. Results are converted to JSON and TOON formats
5. View token savings and cost calculations
6. Copy or download optimized outputs

## Model Pricing Reference

| Model | Input (per 1M tokens) |
|-------|----------------------|
| GPT-4 | $30.00 |
| GPT-4 Turbo | $10.00 |
| GPT-4o | $2.50 |
| Claude Opus 4 | $15.00 |
| Claude Sonnet 4 | $3.00 |
| Claude Haiku | $0.25 |

## License

MIT
