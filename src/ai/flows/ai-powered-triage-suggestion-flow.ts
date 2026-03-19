'use server';
/**
 * @fileOverview An AI agent that provides preliminary triage level suggestions based on patient symptoms.
 *
 * - getTriageSuggestion - A function that handles the AI triage suggestion process.
 * - TriageSuggestionInput - The input type for the getTriageSuggestion function.
 * - TriageSuggestionOutput - The return type for the getTriageSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TriageSuggestionInputSchema = z.object({
  patientSymptoms: z
    .string()
    .describe('A description of the patient\'s initial symptoms.'),
});
export type TriageSuggestionInput = z.infer<typeof TriageSuggestionInputSchema>;

const TriageSuggestionOutputSchema = z.object({
  triageLevel: z
    .enum(['Critical', 'Urgent', 'Minor', 'Deceased'])
    .describe('The suggested triage level for the patient.'),
  justification: z
    .string()
    .describe('A brief explanation for the suggested triage level.'),
});
export type TriageSuggestionOutput = z.infer<
  typeof TriageSuggestionOutputSchema
>;

export async function getTriageSuggestion(
  input: TriageSuggestionInput
): Promise<TriageSuggestionOutput> {
  return triageSuggestionFlow(input);
}

const triageSuggestionPrompt = ai.definePrompt({
  name: 'triageSuggestionPrompt',
  input: {schema: TriageSuggestionInputSchema},
  output: {schema: TriageSuggestionOutputSchema},
  prompt: `You are an expert medical triagist. Based on the patient's symptoms, suggest an appropriate triage level (Critical, Urgent, Minor, or Deceased) and provide a brief justification for your decision.

Patient Symptoms: {{{patientSymptoms}}}
`,
});

const triageSuggestionFlow = ai.defineFlow(
  {
    name: 'triageSuggestionFlow',
    inputSchema: TriageSuggestionInputSchema,
    outputSchema: TriageSuggestionOutputSchema,
  },
  async input => {
    const {output} = await triageSuggestionPrompt(input);
    return output!;
  }
);
