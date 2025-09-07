# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Speech-to-Text Component (`src/components/voice-flow.tsx`)

This component provides a user interface for speech-to-text transcription using the browser's Web Speech API.

### Features

*   **Real-time Transcription**: Converts spoken language into text in real-time.
*   **Start, Pause, and Resume**: Control the recognition process with Start, Pause, and Resume buttons.
*   **Stop and Clear**: A "Stop" button to end the session and clear the transcript.
*   **Multiple Output Formats**: Choose to display the text in a simple `Textarea`, a styled `Card`, or a `Rich Editor`.
*   **Copy to Clipboard**: Easily copy the transcribed text.
*   **Language Support**: Configured for Tamil (`ta-IN`) language recognition.
*   **Error Handling**: Provides feedback if the Speech Recognition API is not supported or if there are microphone errors.
*   **Responsive UI**: Built with Next.js, React, and `shadcn/ui` components.

### How it Works

The component uses the `SpeechRecognition` interface from the Web Speech API.

- When the "Start" button is clicked, a new `SpeechRecognition` instance is created.
- The `onresult` event handler processes the transcription results. It distinguishes between `interim` and `final` results to provide a smooth user experience.
- The `onend` event handler automatically transitions the status to "paused" when the user stops speaking.
- State is managed using React hooks (`useState`, `useRef`, `useEffect`).
- The UI is built with components from `shadcn/ui` and icons from `lucide-react`.

The core logic for processing results is in the `onresult` handler:

```typescriptreact
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
```

This ensures that as the user speaks, the text is continuously updated, and finalized segments are stored.

### Usage

To use this component, simply import it into a page:

```typescriptreact
import { VoiceFlow } from '@/components/voice-flow';

export default function MyPage() {
  return (
    <div className="container mx-auto p-4">
      <VoiceFlow />
    </div>
  );
}
```
