// Use Vite proxy to avoid CORS issues - requests go through /lmstudio and get proxied to localhost:1234
const LM_STUDIO_URL = '/lmstudio/v1';

const SYSTEM_PROMPT = `You are a prompt optimization assistant. Your task is to extract structured data from natural language prompts.

RULES:
1. Identify any data that could be structured (lists, tables, key-value pairs, configurations, examples, etc.)
2. Convert to clean JSON format
3. Preserve ALL information - nothing should be lost
4. If no clear structure exists, set structured_data to null
5. The "task" field should contain the core instruction/request from the prompt
6. The "remaining_context" field should contain any context that doesn't fit into structured data

Return ONLY valid JSON, no explanations or markdown.`;

export const checkLMStudioConnection = async () => {
  try {
    const response = await fetch(`${LM_STUDIO_URL}/models`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        models: data.data || [],
      };
    }
    return { connected: false, error: 'Server responded with error' };
  } catch (error) {
    return {
      connected: false,
      error: 'LM Studio not detected. Please start LM Studio server on 127.0.0.1:1234',
    };
  }
};

export const analyzePrompt = async (userPrompt, modelId = null) => {
  try {
    const requestBody = {
      model: modelId || 'local-model',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze and structure the following prompt:\n\n${userPrompt}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'prompt_structure',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              task: {
                type: 'string',
                description: 'The core task or instruction extracted from the prompt',
              },
              structured_data: {
                type: ['object', 'array', 'null'],
                description: 'Any structured data extracted (lists, tables, configs, examples)',
              },
              remaining_context: {
                type: 'string',
                description: 'Any remaining context that provides additional information',
              },
            },
            required: ['task'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.3,
      max_tokens: 2000,
    };

    const response = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LM Studio error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from LM Studio');
    }

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        data: parsed,
        rawResponse: content,
      };
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data: parsed,
            rawResponse: content,
          };
        } catch {
          // Fall through to error
        }
      }
      return {
        success: false,
        error: 'Failed to parse LLM response as JSON',
        rawResponse: content,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to connect to LM Studio',
    };
  }
};

export const getAvailableModels = async () => {
  try {
    const response = await fetch(`${LM_STUDIO_URL}/models`);
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    return [];
  } catch {
    return [];
  }
};
