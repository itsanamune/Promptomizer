#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Retell AI API base URL
const RETELL_API_BASE = "https://api.retellai.com";

// Get API key from environment
function getApiKey(): string {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) {
    throw new Error("RETELL_API_KEY environment variable is not set");
  }
  return apiKey;
}

// Helper function to make API requests
async function retellRequest(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<unknown> {
  const apiKey = getApiKey();
  const url = `${RETELL_API_BASE}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };

  if (body && (method === "POST" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Retell API error (${response.status}): ${errorText}`
    );
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}

// Define all available tools
const tools: Tool[] = [
  // === Call Operations ===
  {
    name: "create_phone_call",
    description:
      "Create a new outbound phone call using a Retell AI agent. Initiates a phone call from a specified number to a target number.",
    inputSchema: {
      type: "object",
      properties: {
        from_number: {
          type: "string",
          description: "The phone number to call from in E.164 format (e.g., +14157774444)",
        },
        to_number: {
          type: "string",
          description: "The phone number to call to in E.164 format (e.g., +12137774445)",
        },
        override_agent_id: {
          type: "string",
          description: "Optional agent ID to use instead of the default agent bound to the from_number",
        },
        metadata: {
          type: "object",
          description: "Optional custom metadata key-value pairs for the call",
        },
        retell_llm_dynamic_variables: {
          type: "object",
          description: "Optional dynamic variables to pass to the LLM prompt (e.g., customer_name)",
        },
      },
      required: ["from_number", "to_number"],
    },
  },
  {
    name: "create_web_call",
    description:
      "Create a new web call session with a Retell AI agent. Returns an access token for establishing the web call connection.",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: {
          type: "string",
          description: "The unique identifier of the agent to use for the call",
        },
        agent_version: {
          type: "number",
          description: "Optional specific version number of the agent to deploy",
        },
        metadata: {
          type: "object",
          description: "Optional custom metadata key-value pairs for the call",
        },
        retell_llm_dynamic_variables: {
          type: "object",
          description: "Optional dynamic variables to pass to the LLM prompt",
        },
      },
      required: ["agent_id"],
    },
  },
  {
    name: "get_call",
    description:
      "Retrieve details of a specific call by its ID. Returns comprehensive call data including transcript, recording URLs, and analytics.",
    inputSchema: {
      type: "object",
      properties: {
        call_id: {
          type: "string",
          description: "The unique identifier of the call to retrieve",
        },
      },
      required: ["call_id"],
    },
  },
  {
    name: "list_calls",
    description:
      "Retrieve a list of calls with optional filtering and pagination. Can filter by agent, status, type, direction, sentiment, and more.",
    inputSchema: {
      type: "object",
      properties: {
        filter_criteria: {
          type: "object",
          description: "Optional filters to narrow results",
          properties: {
            agent_id: {
              type: "array",
              items: { type: "string" },
              description: "Filter by specific agent IDs",
            },
            call_status: {
              type: "array",
              items: { type: "string", enum: ["registered", "not_connected", "ongoing", "ended", "error"] },
              description: "Filter by call status",
            },
            call_type: {
              type: "array",
              items: { type: "string", enum: ["web_call", "phone_call"] },
              description: "Filter by call type",
            },
            direction: {
              type: "array",
              items: { type: "string", enum: ["inbound", "outbound"] },
              description: "Filter by call direction",
            },
            call_successful: {
              type: "array",
              items: { type: "boolean" },
              description: "Filter by call success status",
            },
          },
        },
        sort_order: {
          type: "string",
          enum: ["ascending", "descending"],
          description: "Sort order by start timestamp (default: descending)",
        },
        limit: {
          type: "number",
          description: "Maximum number of calls to return (1-1000, default: 50)",
        },
        pagination_key: {
          type: "string",
          description: "Pass last call_id from previous response to get next page",
        },
      },
    },
  },
  {
    name: "update_call",
    description: "Update metadata or storage settings for a specific call.",
    inputSchema: {
      type: "object",
      properties: {
        call_id: {
          type: "string",
          description: "The unique identifier of the call to update",
        },
        metadata: {
          type: "object",
          description: "New metadata to set for the call",
        },
      },
      required: ["call_id"],
    },
  },
  {
    name: "delete_call",
    description:
      "Delete a specific call and all its associated data including recordings and transcripts.",
    inputSchema: {
      type: "object",
      properties: {
        call_id: {
          type: "string",
          description: "The unique identifier of the call to delete",
        },
      },
      required: ["call_id"],
    },
  },

  // === Agent Operations ===
  {
    name: "list_agents",
    description:
      "List all voice agents in your Retell account. Returns agent configurations including voice settings, response engine, and webhook URLs.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of agents to return per request",
        },
        pagination_key: {
          type: "string",
          description: "Key for pagination through results",
        },
      },
    },
  },
  {
    name: "get_agent",
    description:
      "Retrieve configuration details for a specific voice agent by ID.",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: {
          type: "string",
          description: "The unique identifier of the agent to retrieve",
        },
        version: {
          type: "number",
          description: "Optional specific version number to retrieve",
        },
      },
      required: ["agent_id"],
    },
  },

  // === Phone Number Operations ===
  {
    name: "list_phone_numbers",
    description:
      "List all phone numbers in your Retell account. Shows bound agents, area codes, and webhook configurations.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_phone_number",
    description: "Retrieve details for a specific phone number.",
    inputSchema: {
      type: "object",
      properties: {
        phone_number: {
          type: "string",
          description: "The phone number to retrieve in E.164 format",
        },
      },
      required: ["phone_number"],
    },
  },

  // === Voice Operations ===
  {
    name: "list_voices",
    description:
      "List all available voices from providers like ElevenLabs, OpenAI, and Deepgram. Includes voice metadata like gender, accent, and preview audio URLs.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // === Knowledge Base Operations ===
  {
    name: "list_knowledge_bases",
    description:
      "List all knowledge bases in your Retell account. Knowledge bases provide context and information for agents.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_knowledge_base",
    description: "Retrieve details for a specific knowledge base by ID.",
    inputSchema: {
      type: "object",
      properties: {
        knowledge_base_id: {
          type: "string",
          description: "The unique identifier of the knowledge base",
        },
      },
      required: ["knowledge_base_id"],
    },
  },

  // === Concurrency Operations ===
  {
    name: "get_concurrency",
    description:
      "Get current concurrency status including ongoing calls count, limits, and available capacity.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Tool execution handlers
async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    // Call Operations
    case "create_phone_call": {
      const body: Record<string, unknown> = {
        from_number: args.from_number,
        to_number: args.to_number,
      };
      if (args.override_agent_id) body.override_agent_id = args.override_agent_id;
      if (args.metadata) body.metadata = args.metadata;
      if (args.retell_llm_dynamic_variables)
        body.retell_llm_dynamic_variables = args.retell_llm_dynamic_variables;
      return retellRequest("POST", "/v2/create-phone-call", body);
    }

    case "create_web_call": {
      const body: Record<string, unknown> = {
        agent_id: args.agent_id,
      };
      if (args.agent_version) body.agent_version = args.agent_version;
      if (args.metadata) body.metadata = args.metadata;
      if (args.retell_llm_dynamic_variables)
        body.retell_llm_dynamic_variables = args.retell_llm_dynamic_variables;
      return retellRequest("POST", "/v2/create-web-call", body);
    }

    case "get_call": {
      return retellRequest("GET", `/v2/get-call/${args.call_id}`);
    }

    case "list_calls": {
      const body: Record<string, unknown> = {};
      if (args.filter_criteria) body.filter_criteria = args.filter_criteria;
      if (args.sort_order) body.sort_order = args.sort_order;
      if (args.limit) body.limit = args.limit;
      if (args.pagination_key) body.pagination_key = args.pagination_key;
      return retellRequest("POST", "/v2/list-calls", body);
    }

    case "update_call": {
      const body: Record<string, unknown> = {};
      if (args.metadata) body.metadata = args.metadata;
      return retellRequest("PATCH", `/v2/update-call/${args.call_id}`, body);
    }

    case "delete_call": {
      return retellRequest("DELETE", `/v2/delete-call/${args.call_id}`);
    }

    // Agent Operations
    case "list_agents": {
      let endpoint = "/list-agents";
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", String(args.limit));
      if (args.pagination_key) params.append("pagination_key", String(args.pagination_key));
      if (params.toString()) endpoint += `?${params.toString()}`;
      return retellRequest("GET", endpoint);
    }

    case "get_agent": {
      let endpoint = `/get-agent/${args.agent_id}`;
      if (args.version) endpoint += `?version=${args.version}`;
      return retellRequest("GET", endpoint);
    }

    // Phone Number Operations
    case "list_phone_numbers": {
      return retellRequest("GET", "/list-phone-numbers");
    }

    case "get_phone_number": {
      return retellRequest("GET", `/get-phone-number/${encodeURIComponent(String(args.phone_number))}`);
    }

    // Voice Operations
    case "list_voices": {
      return retellRequest("GET", "/list-voices");
    }

    // Knowledge Base Operations
    case "list_knowledge_bases": {
      return retellRequest("GET", "/list-knowledge-bases");
    }

    case "get_knowledge_base": {
      return retellRequest("GET", `/get-knowledge-base/${args.knowledge_base_id}`);
    }

    // Concurrency Operations
    case "get_concurrency": {
      return retellRequest("GET", "/get-concurrency");
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Create and run the MCP server
async function main() {
  const server = new Server(
    {
      name: "retell-ai-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleToolCall(name, (args as Record<string, unknown>) || {});
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Retell AI MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
