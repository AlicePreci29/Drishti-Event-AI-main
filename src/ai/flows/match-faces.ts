// Match faces AI agent.
//
// - matchFaces - A function that handles the face matching process.
// - MatchFacesInput - The input type for the matchFaces function.
// - MatchFacesOutput - The return type for the matchFaces function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchFacesInputSchema = z.object({
  missingPersonPhotoDataUri: z
    .string()
    .describe(
      "A photo of the missing person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  cctvFootageDataUri: z
    .string()
    .describe(
      "A frame from the live CCTV footage, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MatchFacesInput = z.infer<typeof MatchFacesInputSchema>;

const MatchFacesOutputSchema = z.object({
  matchFound: z.boolean().describe('Whether a potential match was found.'),
  zone: z.string().describe('The zone where the potential match was found.'),
  confidenceScore: z
    .number()
    .describe("The confidence score of the potential match (0-1). 1 is a perfect match, 0 is no match."),
});
export type MatchFacesOutput = z.infer<typeof MatchFacesOutputSchema>;

export async function matchFaces(input: MatchFacesInput): Promise<MatchFacesOutput> {
  return matchFacesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchFacesPrompt',
  input: {schema: MatchFacesInputSchema},
  output: {schema: MatchFacesOutputSchema},
  prompt: `You are an AI-powered face matching system designed to locate missing persons using live CCTV footage.

You will be provided with a photo of the missing person and a frame from live CCTV footage. Your task is to determine if the missing person is visible in the CCTV footage.

Missing Person Photo: {{media url=missingPersonPhotoDataUri}}
CCTV Footage: {{media url=cctvFootageDataUri}}

Analyze the images and provide the following information:

- matchFound: Set to true if a potential match is found, false otherwise.
- zone: If a match is found, specify the zone where the person was located (e.g., "Entrance", "Hallway", "Exit"). If no match is found, set to "Unknown".
- confidenceScore: Provide a confidence score (0-1) indicating the likelihood of a match. A score of 1 indicates a perfect match, while 0 indicates no match.

Ensure that the output is accurate and reflects the analysis of both images. If there are obstructions, partial faces or the cctv footage is blurry, lower the confidence score accordingly.
`,
});

const matchFacesFlow = ai.defineFlow(
  {
    name: 'matchFacesFlow',
    inputSchema: MatchFacesInputSchema,
    outputSchema: MatchFacesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
