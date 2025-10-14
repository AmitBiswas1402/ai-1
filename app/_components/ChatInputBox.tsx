"use client";

import { Button } from "@/components/ui/button";
import { Mic, Paperclip, Send } from "lucide-react";
import AIMultiModels from "./AIMultiModels";
import { useContext, useEffect, useState } from "react";
import { AISelectedModelContext } from "@/context/AISelectedModels";
import axios from "axios"; 

// Define type for chat message
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
  loading?: boolean;
}

// Define structure for all messages
type MessagesType = Record<string, ChatMessage[]>;

const ChatInputBox = () => {
  const [userInput, setUserInput] = useState<string>(""); 
  const context = useContext(AISelectedModelContext);

  if (!context) {
    throw new Error("ChatInputBox must be used within an AISelectedModelContext.Provider");
  }

  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } = context;

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // 1️⃣ Add user message to all enabled models
    setMessages((prev: MessagesType) => {
      const updated = { ...prev };
      Object.keys(aiSelectedModels).forEach((modelKey) => {
        updated[modelKey] = [
          ...(updated[modelKey] ?? []),
          { role: "user", content: userInput },
        ];
      });
      return updated;
    });

    const currentInput = userInput;
    setUserInput("");

    // 2️⃣ Fetch response from each enabled model
    Object.entries(aiSelectedModels).forEach(async ([parentModel, modelInfo]) => {
      if (!modelInfo.modelId) return;

      // Add loading placeholder
      setMessages((prev: MessagesType) => ({
        ...prev,
        [parentModel]: [
          ...(prev[parentModel] ?? []),
          {
            role: "assistant",
            content: "Thinking...",
            model: parentModel,
            loading: true,
          },
        ],
      }));

      try {
        const result = await axios.post("/api/ai-multi-model", {
          model: modelInfo.modelId,
          msg: [{ role: "user", content: currentInput }],
          parentModel,
        });

        const { aiResponse, model } = result.data;

        // 3️⃣ Add AI response to that model's messages
        setMessages((prev: MessagesType) => {
          const updated = [...(prev[parentModel] ?? [])];
          const loadingIndex = updated.findIndex((m) => m.loading);

          if (loadingIndex !== -1) {
            updated[loadingIndex] = {
              role: "assistant",
              content: aiResponse,
              model,
              loading: false,
            };
          } else {
            updated.push({
              role: "assistant",
              content: aiResponse,
              model,
              loading: false,
            });
          }

          return { ...prev, [parentModel]: updated };
        });
      } catch (err) {
        console.error(err);
        setMessages((prev: MessagesType) => ({
          ...prev,
          [parentModel]: [
            ...(prev[parentModel] ?? []),
            { role: "assistant", content: "Error fetching response." },
          ],
        }));
      }
    });
  };

  useEffect(() => {
    console.log(messages);    
  }, [messages])

  return (
    <div className="relative min-h-screen">
      {/* Page Content */}
      <div>
        <AIMultiModels />
      </div>

      {/* Fixed Chat Input */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-4">
          <input
            type="text"
            placeholder="Start Asking..."
            className="border-0 outline-none w-full"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <div className="mt-3 flex justify-between items-center">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div>
              <Button variant="ghost" size="icon" className="mr-2">
                <Mic />
              </Button>
              <Button
                size="icon"
                className="bg-purple-600"
                onClick={handleSend}
              >
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInputBox;
