import { createContext } from "react";

export interface AIModelsType {
  GPT: { modelId: string };
  Gemini: { modelId: string };
  DeepSeek: { modelId: string };
  Mistral: { modelId: string };
  Grok: { modelId: string };
  Cohere: { modelId: string };
  Llama: { modelId: string };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
  loading?: boolean;
}

export type MessagesType = Record<string, ChatMessage[]>;

export interface AISelectedModelContextType {
  aiSelectedModels: AIModelsType;
  setAiSelectedModels: React.Dispatch<React.SetStateAction<AIModelsType>>;
  messages: MessagesType;
  setMessages: React.Dispatch<React.SetStateAction<MessagesType>>;
}

export const AISelectedModelContext = createContext<AISelectedModelContextType | undefined>(
  undefined
);
