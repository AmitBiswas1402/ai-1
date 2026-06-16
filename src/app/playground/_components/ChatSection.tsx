"use client";

import { Button } from "@/components/ui/button";
import { Messages } from "../[projectId]/page";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loading from "./Loading";

type Props = {
  messages: Messages[];
  onSend: any;
  loading: boolean;
};

const ChatSection = ({ messages, onSend, loading }: Props) => {
  const [input, setInput] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input?.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r shadow-sm lg:w-96">
      {/* messages section */}
      <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !loading ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2.5 max-w-xs text-[13px] leading-relaxed ${message.role === "user" ? "bg-gray-800 text-gray-200 rounded-2xl rounded-br-md" : "bg-gray-100 text-gray-700 rounded-2xl rounded-bl-md border border-gray-200"}`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 bg-gray-100 rounded-2xl rounded-bl-md border border-gray-200/80">
                  <Loading label="Designing your page" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-2">
        <textarea
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] leading-relaxed resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
          placeholder="Type a message..."
          rows={1}
          value={input ?? ""}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!loading) handleSend();
            }
          }}
        />

        <Button
          size="icon"
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl h-9.5 w-9.5 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          onClick={handleSend}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export default ChatSection;
