"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { ArrowUp, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  return (
    <section className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          What should we Design?
        </h1>

        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          Create stunning websites in minutes with our AI-powered design tool.
        </p>
      </div>

      {/* Prompt Box */}
      <div className="mt-10 w-full max-w-4xl">
        <div className="overflow-hidden rounded-3xl border bg-background shadow-xl">
          {/* Text Area */}
          <div className="relative p-6">
            <textarea
              placeholder="Describe your page design..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="
                h-52
                w-full
                resize-none
                bg-transparent
                text-base
                outline-none
                placeholder:text-muted-foreground
              "
            />

            {userInput && (
              <button
                onClick={() => setUserInput("")}
                className="
                  absolute
                  right-5
                  top-5
                  rounded-lg
                  p-2
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                "
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                document.getElementById("image-upload")?.click()
              }
            >
              <ImagePlus className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              disabled={!userInput.trim() || loading}
              className="h-11 w-11 rounded-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;