// src/ai/flows/suggest-roi-parameters.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest optimal ranges for Intervue.io's impact parameters.
 *
 * It takes recruitment metrics as input and uses an AI model to suggest ranges based on industry benchmarks.
 * - suggestROIParameters - A function that handles the suggestion process.
 * - SuggestROIParametersInput - The input type for the suggestROIParameters function.
 * - SuggestROIParametersOutput - The return type for the suggestROIParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestROIParametersInputSchema = z.object({
  timeToHire: z.number().describe('Current time to hire (in days).'),
  costPerHire: z.number().describe('Current cost per hire (in dollars).'),
  employeeTurnoverRate: z.number().describe('Current employee turnover rate (percentage).'),
  interviewVolume: z.number().describe('Monthly interview volume.'),
});
export type SuggestROIParametersInput = z.infer<typeof SuggestROIParametersInputSchema>;

const SuggestROIParametersOutputSchema = z.object({
  intervueImpactParameters: z.object({
    timeToHireReduction: z
      .number()
      .describe('Suggested reduction in time to hire (in days).'),
    costPerHireReduction: z
      .number()
      .describe('Suggested reduction in cost per hire (in dollars).'),
    employeeTurnoverReduction: z
      .number()
      .describe('Suggested reduction in employee turnover rate (percentage).'),
  }),
});
export type SuggestROIParametersOutput = z.infer<typeof SuggestROIParametersOutputSchema>;

export async function suggestROIParameters(
  input: SuggestROIParametersInput
): Promise<SuggestROIParametersOutput> {
  return suggestROIParametersFlow(input);
}

const suggestROIParametersPrompt = ai.definePrompt({
  name: 'suggestROIParametersPrompt',
  input: {schema: SuggestROIParametersInputSchema},
  output: {schema: SuggestROIParametersOutputSchema},
  prompt: `You are an expert in recruitment ROI analysis. Based on the provided recruitment metrics and industry benchmarks, suggest optimal ranges for Intervue.io's impact parameters.

  Consider the following recruitment metrics:
  - Time to Hire: {{timeToHire}} days
  - Cost per Hire: {{costPerHire}} dollars
  - Employee Turnover Rate: {{employeeTurnoverRate}}%
  - Interview Volume: {{interviewVolume}} interviews per month

  Analyze industry data and apply rules for identifying valid ranges for the following Intervue.io impact parameters:
  - Time to Hire Reduction (days)
  - Cost per Hire Reduction (dollars)
  - Employee Turnover Reduction (percentage)

  Provide the suggested optimal ranges in the specified JSON format. Consider that reductions cannot exceed the current values.
  Do not provide commentary outside of the JSON schema.`,
});

const suggestROIParametersFlow = ai.defineFlow(
  {
    name: 'suggestROIParametersFlow',
    inputSchema: SuggestROIParametersInputSchema,
    outputSchema: SuggestROIParametersOutputSchema,
  },
  async input => {
    const {output} = await suggestROIParametersPrompt(input);
    return output!;
  }
);
