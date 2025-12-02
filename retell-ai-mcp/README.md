# Retell AI MCP Server

An MCP (Model Context Protocol) server for the Retell AI API. This server enables AI assistants to interact with Retell AI's voice agent platform for building and managing AI-powered phone calls.

## Features

This MCP server provides tools for:

- **Call Management**: Create phone calls, web calls, list calls, get call details, update and delete calls
- **Agent Management**: List and retrieve voice agent configurations
- **Phone Numbers**: List and get phone number details
- **Voices**: List available voices from ElevenLabs, OpenAI, and Deepgram
- **Knowledge Bases**: List and retrieve knowledge base configurations
- **Concurrency**: Monitor current call capacity and limits

## Installation

```bash
cd retell-ai-mcp
npm install
npm run build
```

## Configuration

Set your Retell AI API key as an environment variable:

```bash
export RETELL_API_KEY="your-api-key-here"
```

Get your API key from the [Retell AI Dashboard](https://dashboard.retellai.com/).

## Usage with Claude Desktop

Add this to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "retell-ai": {
      "command": "node",
      "args": ["/path/to/retell-ai-mcp/dist/index.js"],
      "env": {
        "RETELL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### Call Operations

| Tool | Description |
|------|-------------|
| `create_phone_call` | Create an outbound phone call with a Retell AI agent |
| `create_web_call` | Create a web call session and get access token |
| `get_call` | Get details of a specific call including transcript and recording |
| `list_calls` | List calls with filtering by agent, status, type, direction |
| `update_call` | Update call metadata |
| `delete_call` | Delete a call and its associated data |

### Agent Operations

| Tool | Description |
|------|-------------|
| `list_agents` | List all voice agents in your account |
| `get_agent` | Get configuration for a specific agent |

### Phone Number Operations

| Tool | Description |
|------|-------------|
| `list_phone_numbers` | List all phone numbers with bound agents |
| `get_phone_number` | Get details for a specific phone number |

### Voice Operations

| Tool | Description |
|------|-------------|
| `list_voices` | List all available voices (ElevenLabs, OpenAI, Deepgram) |

### Knowledge Base Operations

| Tool | Description |
|------|-------------|
| `list_knowledge_bases` | List all knowledge bases |
| `get_knowledge_base` | Get details for a specific knowledge base |

### Concurrency Operations

| Tool | Description |
|------|-------------|
| `get_concurrency` | Get current concurrency status and limits |

## Example Usage

Once configured, you can ask Claude to:

- "List all my Retell AI agents"
- "Create a phone call from +14157774444 to +12137774445"
- "Get the details and transcript for call ID abc123"
- "List all available voices"
- "Check my current call concurrency limits"

## API Reference

For full API documentation, see [Retell AI Docs](https://docs.retellai.com/).

## License

MIT
