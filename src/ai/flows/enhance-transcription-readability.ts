'use server';

/**
 * @fileOverview Enhances the readability of transcribed Tamil text by adding proper spacing, punctuation, and grammatical structure.
 *
 * - enhanceTranscriptionReadability - A function that enhances the readability of the transcribed text.
 * - EnhanceTranscriptionReadabilityInput - The input type for the enhanceTranscriptionReadability function.
 * - EnhanceTranscriptionReadabilityOutput - The return type for the enhanceTranscriptionReadability function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceTranscriptionReadabilityInputSchema = z.object({
  tamilText: z.string().describe('The Tamil text to enhance for readability.'),
});
export type EnhanceTranscriptionReadabilityInput = z.infer<typeof EnhanceTranscriptionReadabilityInputSchema>;

const EnhanceTranscriptionReadabilityOutputSchema = z.object({
  enhancedText: z.string().describe('The enhanced Tamil text with proper spacing, punctuation, and grammatical structure.'),
});
export type EnhanceTranscriptionReadabilityOutput = z.infer<typeof EnhanceTranscriptionReadabilityOutputSchema>;

export async function enhanceTranscriptionReadability(input: EnhanceTranscriptionReadabilityInput): Promise<EnhanceTranscriptionReadabilityOutput> {
  return enhanceTranscriptionReadabilityFlow(input);
}

const enhanceTranscriptionReadabilityPrompt = ai.definePrompt({
  name: 'enhanceTranscriptionReadabilityPrompt',
  input: {schema: EnhanceTranscriptionReadabilityInputSchema},
  output: {schema: EnhanceTranscriptionReadabilityOutputSchema},
  prompt: `You are an expert in Tamil language and grammar. Your task is to enhance the readability of the given Tamil text by adding proper spacing, punctuation, and grammatical structure.

Tamil Text: {{{tamilText}}}

Enhanced Tamil Text:`,
});

const enhanceTranscriptionReadabilityFlow = ai.defineFlow(
  {
    name: 'enhanceTranscriptionReadabilityFlow',
    inputSchema: EnhanceTranscriptionReadabilityInputSchema,
    outputSchema: EnhanceTranscriptionReadabilityOutputSchema,
  },
  async input => {
    const {output} = await enhanceTranscriptionReadabilityPrompt(input);
    return output!;
  }
);
