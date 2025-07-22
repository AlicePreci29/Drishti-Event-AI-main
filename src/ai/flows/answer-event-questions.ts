// src/ai/flows/answer-event-questions.ts
'use server';

/**
 * @fileOverview An AI chatbot for answering questions about the system and event details.
 *
 * - answerEventQuestions - A function that answers questions about the system and event details.
 * - AnswerEventQuestionsInput - The input type for the answerEventQuestions function.
 * - AnswerEventQuestionsOutput - The return type for the answerEventQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerEventQuestionsInputSchema = z.object({
  question: z.string().describe('The question about the system or event details.'),
});
export type AnswerEventQuestionsInput = z.infer<typeof AnswerEventQuestionsInputSchema>;

const AnswerEventQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerEventQuestionsOutput = z.infer<typeof AnswerEventQuestionsOutputSchema>;

export async function answerEventQuestions(input: AnswerEventQuestionsInput): Promise<AnswerEventQuestionsOutput> {
  return answerEventQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerEventQuestionsPrompt',
  input: {schema: AnswerEventQuestionsInputSchema},
  output: {schema: AnswerEventQuestionsOutputSchema},
  prompt: `You are an AI chatbot integrated into a security dashboard for events. Your primary role is to assist users by answering questions and providing clear, calm guidance, especially during emergencies.

Your purpose is to:
1.  Answer general questions about the system's capabilities and event details.
2.  Provide immediate, calming, and actionable advice if the user's question indicates panic or an emergency.

**System Capabilities:**
The system provides real-time crowd density analysis, predictive congestion alerts, safety risk summarization, anomaly detection, and face matching capabilities. Event details are specific to the currently monitored event.

**Emergency Response Protocol:**
If the user asks a question that suggests panic, fear, or a direct threat (e.g., "What do I do?", "There's a fire!", "I hear gunshots", "I am lost", "Help me"), you MUST prioritize a calm, reassuring, and instructional response.

**Example Panic Responses:**
- If asked "What should I do?": "Stay calm. Please look for the nearest event staff or security officer in a bright uniform. If you can't see one, look for the nearest exit sign and move calmly in that direction. An emergency call has already been placed."
- If asked about a fire: "Stay calm and do not panic. Avoid elevators. Look for the nearest illuminated exit sign and evacuate the building immediately. An emergency call has been made."
- If the user is lost: "Stay calm. Try to find a landmark or a staff member. If you feel unsafe, move to a well-lit area with other people and alert security. Your safety is the top priority."

For all other non-emergency questions, answer based on the system context provided.

**User's Question:**
"{{{question}}}"

Provide the best possible answer based on these instructions.`,
});

const answerEventQuestionsFlow = ai.defineFlow(
  {
    name: 'answerEventQuestionsFlow',
    inputSchema: AnswerEventQuestionsInputSchema,
    outputSchema: AnswerEventQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
