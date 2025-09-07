"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Copy, Mic, MicOff, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function VoiceFlow() {
  const [status, setStatus] = useState<"idle" | "recording" | "paused">("idle");
  const [text, setText] = useState("");
  const [outputMode, setOutputMode] = useState<"textarea" | "card" | "editor">("textarea");
  const [isClient, setIsClient] = useState(false);
  // const [selectedLanguage, setSelectedLanguage] = useState("en-US"); for english

    const [selectedLanguage, setSelectedLanguage] = useState("ta-IN"); // Add this to your state declarations

  // Keep the recognition instance here (any because TS DOM types for SpeechRecognition may not exist)
  const recognitionRef = useRef<any | null>(null);
  const finalTranscriptRef = useRef<string>("");

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);

    return () => {
      if (recognitionRef.current) {
        stopRecognition("idle");
      }
    };
  }, []);

  // Resolve the constructor only on client
  const SpeechRecognitionCtor = isClient
    ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
    : null;

  const isApiSupported = !!SpeechRecognitionCtor;

  const startRecognition = () => {
    if (!SpeechRecognitionCtor) return;

    // initialize final transcript with current text so resume keeps previous content
    finalTranscriptRef.current = text;

    // create a new recognition instance
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = selectedLanguage; // Use selected language instead of hardcoded "ta-IN"
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      // event typing is any to avoid missing lib types
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setText(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onend = () => {
      // when the recognition naturally stops (e.g. user silence), set paused
      if (recognitionRef.current) {
        setStatus("paused");
      }
    };

    recognition.onerror = (err: any) => {
      // optional: you can show a toast for errors
      console.error("SpeechRecognition error", err);
      toast({
        title: "Microphone error",
        description: "There was an issue with speech recognition. Check microphone permissions.",
      });
      setStatus("idle");
      recognitionRef.current = null;
    };

    recognition.start();
    setStatus("recording");
    recognitionRef.current = recognition;
  };

  const stopRecognition = (nextStatus: "paused" | "idle") => {
    if (recognitionRef.current) {
      // remove handlers to avoid onend setting paused unexpectedly after stop
      try {
        recognitionRef.current.onend = null;
      } catch {
        /* ignore */
      }
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    setStatus(nextStatus);
    if (nextStatus === "idle") {
      setText("");
      finalTranscriptRef.current = "";
    }
  };

  const handlePrimaryClick = () => {
    if (status === "idle" || status === "paused") {
      startRecognition();
    } else {
      stopRecognition("paused");
    }
  };

  const handleStopClick = () => {
    stopRecognition("idle");
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Success!",
      description: "Text copied to clipboard.",
    });
  };

  const renderTextOutput = () => {
    switch (outputMode) {
      case "card":
        return (
          <Card className="min-h-[250px] p-4 bg-background/50 overflow-y-auto">
            <p className="whitespace-pre-wrap">{text || "Recognized text will appear here..."}</p>
          </Card>
        );
      case "editor":
        return (
          <div
            contentEditable
            onInput={(e) => setText(e.currentTarget.textContent || "")}
            className="min-h-[250px] p-4 rounded-md border border-input bg-card focus:ring-2 focus:ring-ring focus:outline-none whitespace-pre-wrap overflow-y-auto"
            suppressContentEditableWarning={true}
          >
            {text}
          </div>
        );
      case "textarea":
      default:
        return (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Recognized text will appear here..."
            className="min-h-[250px] text-base resize-none"
          />
        );
    }
  };

  const getPrimaryButton = () => {
    if (status === "recording") {
      return (
        <Button onClick={handlePrimaryClick} size="lg" variant="secondary" className="w-40">
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </Button>
      );
    }
    const label = status === "paused" ? "Resume" : "Start";
    return (
      <Button onClick={handlePrimaryClick} size="lg" disabled={!isApiSupported} className="w-40">
        <Play className="mr-2 h-4 w-4" />
        {label}
      </Button>
    );
  };

  return (
    <Card className="w-full shadow-2xl shadow-primary/10">
      <CardHeader>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex-1">
            <CardTitle>Editor</CardTitle>
            <CardDescription>Select an output format and start speaking.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={outputMode} onValueChange={(value) => setOutputMode(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Output Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="card">Styled Card</SelectItem>
                <SelectItem value="editor">Rich Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!text}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy text</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isApiSupported && isClient && (
          <div className="text-destructive text-center p-4 bg-destructive/10 rounded-md mb-4">
            Speech Recognition API is not supported in this browser. Please try Chrome or Edge.
          </div>
        )}
        {renderTextOutput()}
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-6 pt-6">
        <Mic
          className={cn(
            "h-12 w-12 text-muted-foreground transition-colors",
            status === "recording" && "text-accent animate-pulse"
          )}
        />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {getPrimaryButton()}
          <Button onClick={handleStopClick} size="lg" variant="destructive" disabled={status === "idle"}>
            <MicOff className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
