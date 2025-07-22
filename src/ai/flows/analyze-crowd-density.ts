// src/ai/flows/analyze-crowd-density.ts
'use server';

/**
 * @fileOverview Analyzes crowd density from an image to identify potential bottlenecks and generate a heatmap.
 *
 * - analyzeCrowdDensity - A function that analyzes crowd density from an image.
 * - AnalyzeCrowdDensityInput - The input type for the analyzeCrowdDensity function.
 * - AnalyzeCrowdDensityOutput - The return type for the analyzeCrowdDensity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCrowdDensityInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo from a CCTV feed or uploaded image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional().describe("The user's current location (latitude and longitude)."),
});
export type AnalyzeCrowdDensityInput = z.infer<typeof AnalyzeCrowdDensityInputSchema>;

const AnalyzeCrowdDensityOutputSchema = z.object({
  densityAnalysis: z.array(
    z.object({
      zone: z.string().describe('The zone identifier (e.g., Zone A, Entrance 1).'),
      density: z
        .enum(['Low', 'Medium', 'High'])
        .describe('The crowd density level in the zone.'),
      bottleneckRisk: z.boolean().describe('Whether there is a bottleneck risk in this zone.'),
    })
  ).describe('An analysis of crowd density in different zones.'),
  overallAssessment: z.string().describe('An overall assessment of the crowd density and potential issues, considering the location if provided.').optional(),
  heatmapDataUri: z.string().describe("A data URI of the heatmap image generated from the analysis. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeCrowdDensityOutput = z.infer<typeof AnalyzeCrowdDensityOutputSchema>;

export async function analyzeCrowdDensity(input: AnalyzeCrowdDensityInput): Promise<AnalyzeCrowdDensityOutput> {
  return analyzeCrowdDensityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCrowdDensityPrompt',
  input: {schema: AnalyzeCrowdDensityInputSchema},
  output: {schema: AnalyzeCrowdDensityOutputSchema},
  prompt: `You are an expert in crowd management and security analysis. You are analyzing an image to assess crowd density, identify potential bottlenecks, and generate a heatmap.

Analyze the following image.
Image: {{media url=photoDataUri}}

{{#if location}}The image was taken at the following location: Latitude: {{{location.latitude}}}, Longitude: {{{location.longitude}}}. Use this location information to provide more context to your assessment.{{/if}}

First, divide the image into logical zones and provide a crowd density analysis for each zone. Highlight zones with Low, Medium, and High density. Also, identify zones with potential bottleneck risks.

Second, generate a heatmap overlay on the original image. The heatmap should visually represent the crowd density, with warmer colors (red, orange) for high-density areas and cooler colors (blue, green) for low-density areas. The heatmap should be transparent enough to see the original image underneath. Provide this heatmap as a base64-encoded data URI in the 'heatmapDataUri' field.

Finally, provide an overall assessment of the crowd density and potential issues based on your zone analysis.

Respond in JSON format.
`,
});

const analyzeCrowdDensityFlow = ai.defineFlow(
  {
    name: 'analyzeCrowdDensityFlow',
    inputSchema: AnalyzeCrowdDensityInputSchema,
    outputSchema: AnalyzeCrowdDensityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
