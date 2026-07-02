"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { ArrowUp, ChevronDown, ImagePlus, Loader2Icon, X, Globe, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const genRandom = () => String(Math.floor(Math.random() * 10000));

const Hero = () => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"prompt" | "url">("prompt");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scrapeStep, setScrapeStep] = useState("");

  const router = useRouter();

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file");
    }
    e.target.value = "";
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleScrollDown = () => {
    const projectsSection = document.getElementById("projects-section");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollBy({ top: window.innerHeight * 0.45, behavior: "smooth" });
  };

  const CreateNewProject = async () => {
    setLoading(true);
    const projectId = uuidv4();
    const frameId = genRandom();

    try {
      let messages: any[] = [];
      let imageUrl: string | null = null;

      if (activeTab === "url") {
        if (!websiteUrl.trim()) {
          toast.error("Please enter a website URL");
          setLoading(false);
          return;
        }

        setScrapeStep("Connecting to website...");
        let scrapeData;
        try {
          const scrapeRes = await axios.post("/api/scrape-website", {
            url: websiteUrl,
          });
          scrapeData = scrapeRes.data;
        } catch (err: any) {
          const errMsg = err.response?.data?.error || "Could not scrape the website.";
          toast.error(errMsg + " Attempting fallback generation.");
          scrapeData = {
            title: new URL(websiteUrl.startsWith("http") ? websiteUrl : "https://" + websiteUrl).hostname,
            description: "Website clone",
            cleanHtml: `<!-- Scraping failed for URL: ${websiteUrl} -->`,
            text: `Target URL: ${websiteUrl}`,
            ogImage: null
          };
        }

        setScrapeStep("Analyzing page structure...");
        await new Promise((r) => setTimeout(r, 600));

        setScrapeStep("Extracting visual layout & styling...");
        await new Promise((r) => setTimeout(r, 600));

        setScrapeStep("Initializing AI website builder...");
        await new Promise((r) => setTimeout(r, 400));

        const promptText = `Please clone/recreate the website at URL: ${websiteUrl}.
Original Page Title: ${scrapeData.title || "Not found"}
Original Page Description: ${scrapeData.description || "Not found"}

Below is the extracted HTML body layout structure (cleaned of scripts and styles):
\`\`\`html
${scrapeData.cleanHtml || "<!-- Empty or unreadable HTML structure -->"}
\`\`\`

Text content outline of the page:
${scrapeData.text || "No text content found"}

${
  userInput.trim()
    ? `Additional Custom Instructions from User:\n${userInput}`
    : "Recreate the layout as closely as possible, using professional modern styling with Tailwind CSS and Flowbite."
}`;

        messages = [
          {
            role: "user",
            content: promptText,
            ...(scrapeData.ogImage ? { image: scrapeData.ogImage } : {}),
          },
        ];
      } else {
        if (!userInput.trim()) {
          toast.error("Please enter a design description");
          setLoading(false);
          return;
        }

        setScrapeStep("Uploading assets...");
        if (imageFile) {
          const formData = new FormData();
          formData.append("file", imageFile);
          const uploadRes = await axios.post("/api/images/upload", formData);
          imageUrl = uploadRes.data.url;
        }

        setScrapeStep("Initializing design model...");
        messages = [
          {
            role: "user",
            content: userInput,
            ...(imageUrl ? { image: imageUrl } : {}),
          },
        ];
      }

      await axios.post("/api/projects", {
        projectId,
        frameId,
        messages,
      });

      toast.success("Project created successfully!");
      router.push(`/playground/${projectId}?frameId=${frameId}`);
    } catch (error) {
      toast.error("Failed to create project.");
      console.error(error);
    } finally {
      setLoading(false);
      setScrapeStep("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const canSubmit = activeTab === "prompt" ? userInput.trim() : websiteUrl.trim();
      if (canSubmit && !loading) {
        CreateNewProject();
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (websiteUrl.trim() && !loading) {
        CreateNewProject();
      }
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
      <div className="relative mt-10 w-full max-w-4xl">
        <div
          className="pointer-events-none absolute inset-0 rounded-[32px] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%)",
            filter: "blur(12px)",
          }}
        />

        <div className="relative rounded-[28px] border border-border/60 bg-card/60 p-5 shadow-xl backdrop-blur-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                {activeTab === "url" ? "Analyzing Website UI" : "Initializing Project"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground min-h-[1.5rem] transition-all animate-pulse">
                {scrapeStep}
              </p>
            </div>
          ) : (
            <>
              {activeTab === "prompt" ? (
                <>
                  {imagePreview && (
                    <div className="relative mb-4 overflow-hidden rounded-xl border border-border/40 bg-accent/10">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto max-h-60 w-full rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-2 top-2 cursor-pointer rounded-full border border-border/45 bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-destructive/20 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      placeholder="Describe your page design..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-24 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 md:text-[15px]"
                    />
                    {userInput && (
                      <button
                        type="button"
                        onClick={() => setUserInput("")}
                        aria-label="Clear prompt"
                        className="absolute right-1 top-1 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Website URL Input */}
                  <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/30 px-3 py-2.5 transition-all focus-within:border-primary/50">
                    <Globe className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter website link to clone (e.g., https://example.com)..."
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
                    />
                    {websiteUrl && (
                      <button
                        type="button"
                        onClick={() => setWebsiteUrl("")}
                        className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Custom Instructions */}
                  <div className="relative">
                    <textarea
                      placeholder="Optional: Enter custom modifications (e.g., 'Make it modern dark mode', 'Change primary color to orange')..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-16 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 md:text-[15px]"
                    />
                    {userInput && (
                      <button
                        type="button"
                        onClick={() => setUserInput("")}
                        aria-label="Clear instructions"
                        className="absolute right-1 top-1 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab Switcher */}
              <div className="mt-4 flex items-center gap-1 rounded-full border border-border/30 bg-muted/40 p-0.5 w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("prompt")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    activeTab === "prompt"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Text Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("url")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    activeTab === "url"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Clone Website URL
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
                {activeTab === "prompt" ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      id="image-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="h-9 w-9 rounded-xl text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary cursor-pointer"
                    >
                      <ImagePlus className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <div className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5 select-none">
                    <Globe className="h-3.5 w-3.5 text-primary/60" />
                    Website structure & layout will be analyzed automatically
                  </div>
                )}

                <Button
                  size="icon-lg"
                  disabled={(activeTab === "prompt" ? !userInput.trim() : !websiteUrl.trim()) || loading}
                  className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.04] hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  onClick={CreateNewProject}
                >
                  <ArrowUp />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-3">
        <div className="pointer-events-none h-12 w-full bg-linear-to-t from-muted/50 to-transparent" />
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll down"
          className="-mt-1 cursor-pointer rounded-full border border-border/50 bg-background/80 p-2 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/80"
        >
          <ChevronDown className="h-6 w-6 animate-scroll-hint" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
