import { VoiceFlow } from '@/components/voice-flow';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">
            Tamil VoiceFlow
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Effortlessly convert your Tamil speech into text.
          </p>
        </header>
        <VoiceFlow />
      </div>
    </main>
  );
}
