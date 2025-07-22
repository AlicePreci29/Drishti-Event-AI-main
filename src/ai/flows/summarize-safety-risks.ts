'use server';

/**
 * @fileOverview Summarizes the top safety risks in a specified zone based on security alerts, crowd sensor data, and social media trends.
 *
 * - summarizeSafetyRisks - A function that handles the summarization of safety risks.
 * - SummarizeSafetyRisksInput - The input type for the summarizeSafetyRisks function.
 * - SummarizeSafetyRisksOutput - The return type for the summarizeSafetyRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSafetyRisksInputSchema = z.object({
  zone: z.string().describe('The specific zone for which to summarize safety risks.'),
  securityAlerts: z.string().describe('A summary of recent security alerts in the zone.'),
  crowdSensorData: z.string().describe('Data from crowd sensors in the zone, including density and movement.'),
  socialMediaTrends: z.string().describe('Trends from social media related to the zone, indicating potential issues.'),
});
export type SummarizeSafetyRisksInput = z.infer<typeof SummarizeSafetyRisksInputSchema>;

const SummarizeSafetyRisksOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the top safety risks in the specified zone.'),
});
export type SummarizeSafetyRisksOutput = z.infer<typeof SummarizeSafetyRisksOutputSchema>;

export async function summarizeSafetyRisks(input: SummarizeSafetyRisksInput): Promise<SummarizeSafetyRisksOutput> {
  return summarizeSafetyRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSafetyRisksPrompt',
  input: {schema: SummarizeSafetyRisksInputSchema},
  output: {schema: SummarizeSafetyRisksOutputSchema},
  prompt: `You are a security expert tasked with summarizing the top safety risks in a specific zone.

  Given the following information, provide a concise summary of the key safety risks:

  Zone: {{{zone}}}
  Security Alerts: {{{securityAlerts}}}
  Crowd Sensor Data: {{{crowdSensorData}}}
  Social Media Trends: {{{socialMediaTrends}}}

  Summary:`, // Output must be a single paragraph
});

const summarizeSafetyRisksFlow = ai.defineFlow(
  {
    name: 'summarizeSafetyRisksFlow',
    inputSchema: SummarizeSafetyRisksInputSchema,
    outputSchema: SummarizeSafetyRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
