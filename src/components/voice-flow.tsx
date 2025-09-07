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
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function VoiceFlow() {
  const [status, setStatus] = useState<"idle" | "recording" | "paused">("idle");
  const [text, setText] = useState("");
  const [outputMode, setOutputMode] = useState<"textarea" | "card" | "editor">("textarea");
  const [isClient, setIsClient] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedTextRef = useRef("");

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const SpeechRecognition = isClient ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const isApiSupported = !!SpeechRecognition;

  const startRecognition = () => {
    if (!SpeechRecognition) return;

    accumulatedTextRef.current = text + (text ? " " : "");

    const recognition = new SpeechRecognition();
    recognition.lang = "ta-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setText(accumulatedTextRef.current + finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        setStatus("paused");
        recognitionRef.current = null;
      }
    };
    
    recognition.start();
    setStatus("recording");
    recognitionRef.current = recognition;
  };

  const stopRecognition = (nextStatus: "paused" | "idle") => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; 
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setStatus(nextStatus);
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
    if (status === 'recording') {
        return (
            <Button onClick={handlePrimaryClick} size="lg" variant="secondary" className="w-40">
                <Pause className="mr-2 h-4 w-4" />
                Pause
            </Button>
        );
    }
    const label = status === 'paused' ? 'Resume' : 'Start';
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
        <Mic className={cn("h-12 w-12 text-muted-foreground transition-colors", status === 'recording' && "text-accent animate-pulse")} />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {getPrimaryButton()}
          <Button onClick={handleStopClick} size="lg" variant="destructive" disabled={status === 'idle'}>
            <MicOff className="mr-2 h-4 w-4" />
            Stop
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
