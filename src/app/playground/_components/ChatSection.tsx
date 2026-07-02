"use client";

import { Button } from "@/components/ui/button";
import { Messages } from "../[projectId]/page";
import { ArrowUp, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loading from "./Loading";

type Props = {
  messages: Messages[];
  onSend: any;
  loading: boolean;
};

const ChatSection = ({ messages, onSend, loading }: Props) => {
  const [input, setInput] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSend = () => {
    if (!input?.trim() && !imageFile) return;
    onSend(input || "", imageFile);
    setInput("");
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
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
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded screenshot"
                        className="mb-2 max-h-40 w-full rounded-lg object-cover"
                      />
                    )}
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

      {imagePreview && (
        <div className="px-4 pt-3 flex items-center">
          <div className="relative inline-block border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
            <img src={imagePreview} alt="Upload preview" className="max-h-20 max-w-[150px] object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-gray-800/80 text-white hover:bg-gray-900 rounded-full p-1 cursor-pointer transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-2">
        <input
          type="file"
          accept="image/*"
          id="chat-image-upload"
          onChange={handleImageChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => document.getElementById("chat-image-upload")?.click()}
          className="h-9.5 w-9.5 rounded-xl text-gray-500 hover:bg-gray-100 cursor-pointer shrink-0"
          disabled={loading}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>

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
          disabled={loading || (!input?.trim() && !imageFile)}
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
