'use server';

/**
 * @fileOverview A visual anomaly detection AI agent.
 *
 * - detectAnomalies - A function that handles the anomaly detection process.
 * - DetectAnomaliesInput - The input type for the detectAnomalies function.
 * - DetectAnomaliesOutput - The return type for the detectAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAnomaliesInputSchema = z.object({
  videoFeedDataUri: z
    .string()
    .describe(
      "A frame from a live video feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.object({
      latitude: z.number(),
      longitude: z.number(),
  }).optional().describe("The user's current location (latitude and longitude)."),
});
export type DetectAnomaliesInput = z.infer<typeof DetectAnomaliesInputSchema>;

const DetectAnomaliesOutputSchema = z.object({
  anomalyDetected: z.boolean().describe('Whether or not an anomaly is detected. "normal_walk" is not an anomaly.'),
  anomalyType: z
    .enum([
        'normal_walk',
        'panic_run',
        'loitering',
        'crowd_gathering',
        'fall_detected',
        'fight',
        'reverse_flow',
        'entry_breach',
        'object_abandon',
        'overcrowd',
        'rapid_dispersion',
        'hand_cover_face',
        'cover_eyes',
        'other'
    ])
    .describe('The type of action or anomaly detected.'),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'None']).describe('The risk level of the detected anomaly.'),
  recommendedResponse: z.string().describe('Recommended response to the detected anomaly.'),
  description: z.string().describe('A detailed description of the detected anomaly and what is happening.'),
});
export type DetectAnomaliesOutput = z.infer<typeof DetectAnomaliesOutputSchema>;

export async function detectAnomalies(input: DetectAnomaliesInput): Promise<DetectAnomaliesOutput> {
  return detectAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAnomaliesPrompt',
  input: {schema: DetectAnomaliesInputSchema},
  output: {schema: DetectAnomaliesOutputSchema},
  prompt: `You are a security expert responsible for monitoring live video feeds for anomalies.

You will analyze the video feed and identify any potential anomalies based on the following list of actions. For each action, determine if it constitutes an anomaly, assess its risk level, and provide a recommended response and a detailed description.

Action List:
- normal_walk: Casual, steady walking (normal behavior, not an anomaly, risk level is None).
- panic_run: Group or individual running suddenly, indicating panic or emergency.
- loitering: Prolonged idle standing, especially near entry/exit points.
- crowd_gathering: Sudden clustering of people in a small area.
- fall_detected: Person collapsing or falling down.
- fight: Aggressive actions like punching, pushing, kicking.
- reverse_flow: Walking/running against the crowd flow.
- entry_breach: Unauthorized entry into restricted areas.
- object_abandon: Suspicious object left unattended.
- overcrowd: Dangerous crowd density in a small area.
- rapid_dispersion: Crowd quickly splitting or scattering.
- hand_cover_face: Person intentionally covering their face with hand.
- cover_eyes: Person shielding or hiding their eyes, possibly avoiding detection.
- other: Any other detected suspicious activity.

If the behavior is 'normal_walk', set anomalyDetected to false and riskLevel to 'None'. For all other actions, set anomalyDetected to true.
{{#if location}}
The incident occured at the following location: Latitude: {{{location.latitude}}}, Longitude: {{{location.longitude}}}. Include this information in your description.
{{/if}}

Video Feed: {{media url=videoFeedDataUri}}`,
});

const detectAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectAnomaliesFlow',
    inputSchema: DetectAnomaliesInputSchema,
    outputSchema: DetectAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
