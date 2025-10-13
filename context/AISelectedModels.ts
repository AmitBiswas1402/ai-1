import { createContext } from "react";
import { DefaultModel } from "@/shared/AIModelsShared";

export interface AIModelsType {
  GPT: { modelId: string };
  Gemini: { modelId: string };
  DeepSeek: { modelId: string };
  Mistral: { modelId: string };
  Grok: { modelId: string };
  Cohere: { modelId: string };
  Llama: { modelId: string };
}

interface AISelectedModelContextType {
  aiSelectedModels: AIModelsType;
  setAiSelectedModels: React.Dispatch<React.SetStateAction<AIModelsType>>;
}

export const AISelectedModelContext = createContext<AISelectedModelContextType | undefined>(
  undefined
);
