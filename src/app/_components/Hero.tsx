"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { ArrowUp, ChevronDown, ImagePlus, Loader2Icon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const genRandom = () => String(Math.floor(Math.random() * 10000));

const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const CreateNewProject = async () => {
    setLoading(true);
    const projectId = uuidv4();
    const frameId = genRandom();
    const messages = [
      {
        role: "user",
        content: userInput,
      },
    ];

    try {
      const result = await axios.post("/api/projects", {
        projectId,
        frameId,
        messages,
      });
      // console.log(result.data);
      toast.success("Project created successfully!");
      router.push(`/playground/${projectId}?frameId=${frameId}`);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to create project.");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-5.5rem)] snap-start flex-col items-center justify-center px-4 pb-2">
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
              className="h-52 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />

            {userInput && (
              <button
                onClick={() => setUserInput("")}
                className="absolute right-5 top-5 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <ImagePlus className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              disabled={!userInput.trim() || loading}
              className="h-11 w-11 rounded-full cursor-pointer bg-primary p-0 text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={CreateNewProject}
            >
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-3"
        aria-hidden
      >
        <div className="h-12 w-full bg-linear-to-t from-muted/50 to-transparent" />
        <ChevronDown className="-mt-1 h-4 w-4 animate-scroll-hint text-muted-foreground/50" />
      </div>
    </section>
  );
};

export default Hero;
