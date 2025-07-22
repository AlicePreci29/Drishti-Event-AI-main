import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-crowd-density.ts';
import '@/ai/flows/answer-event-questions.ts';
import '@/ai/flows/match-faces.ts';
import '@/ai/flows/detect-anomalies.ts';
import '@/ai/flows/summarize-safety-risks.ts';
