"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Download, ExternalLink, Check, AlertCircle } from "lucide-react";

type ExternalAIReviewProps = {
  candidateId: string;
  candidateName: string;
};

export function ExternalAIReviewDialog({ candidateId, candidateName }: ExternalAIReviewProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewPrompt, setReviewPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReviewPrompt = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/candidates/${candidateId}/ai-review-prompt`);
      const data = await response.json();
      setReviewPrompt(data.prompt);
    } catch (error) {
      console.error("Failed to generate review prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (reviewPrompt) {
      navigator.clipboard.writeText(reviewPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (reviewPrompt) {
      const blob = new Blob([reviewPrompt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-review-prompt-${candidateName.replace(/\s+/g, "-").toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const openExternalAI = (provider: string) => {
    let url = "";
    switch (provider) {
      case "chatgpt":
        url = "https://chat.openai.com/";
        break;
      case "claude":
        url = "https://claude.ai/";
        break;
      case "grok":
        url = "https://grok.x.ai/";
        break;
      case "copilot":
        url = "https://copilot.microsoft.com/";
        break;
    }
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen && !reviewPrompt) {
        generateReviewPrompt();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30">
          <Sparkles className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
          Review with External AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-purple-600" />
            External AI Review for {candidateName}
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive review prompt to submit to external AI services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Notice */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Privacy Notice
                </p>
                <p className="text-amber-800 dark:text-amber-200">
                  Candidate information will only leave this system if you choose to copy and
                  submit it to an external AI service. We do not automatically transmit any data.
                  This prompt excludes internal AI scores and protected characteristics.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="providers">AI Providers</TabsTrigger>
              <TabsTrigger value="prompt">Review Prompt</TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Choose an AI provider to open in a new tab. Copy the review prompt and paste it
                into the provider&apos;s chat interface.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 dark:border-green-800"
                  onClick={() => openExternalAI("chatgpt")}
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">ChatGPT</div>
                    <div className="text-xs text-muted-foreground">chat.openai.com</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                  onClick={() => openExternalAI("claude")}
                >
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Claude</div>
                    <div className="text-xs text-muted-foreground">claude.ai</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                  onClick={() => openExternalAI("grok")}
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Grok</div>
                    <div className="text-xs text-muted-foreground">grok.x.ai</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800"
                  onClick={() => openExternalAI("copilot")}
                >
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Microsoft Copilot</div>
                    <div className="text-xs text-muted-foreground">copilot.microsoft.com</div>
                  </div>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="prompt" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : reviewPrompt ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Full Prompt
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download as TXT
                    </Button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-[400px] whitespace-pre-wrap font-mono">
                      {reviewPrompt}
                    </pre>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    This prompt contains comprehensive candidate and position information for
                    independent AI evaluation. Internal AI scores and recommendations have been
                    excluded to ensure an unbiased external review.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Failed to generate review prompt. Please try again.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
