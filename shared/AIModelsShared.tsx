export interface DefaultModelType {
  GPT: { modelId: string };
  Gemini: { modelId: string };
  DeepSeek: { modelId: string };
  Mistral: { modelId: string };
  Grok: { modelId: string };
  Cohere: { modelId: string };
  Llama: { modelId: string };
}

export const DefaultModel: DefaultModelType = {
  GPT: { modelId: "gpt-4.1-mini" },
  Gemini: { modelId: "gemini-2.5-flash-lite" },
  DeepSeek: { modelId: "DeepSeek-R1" },
  Mistral: { modelId: "mistral-medium-2505" },
  Grok: { modelId: "grok-3-mini" },
  Cohere: { modelId: "cohere-command-a" },
  Llama: { modelId: "Llama-3.3-70B-Instruct" },
};
