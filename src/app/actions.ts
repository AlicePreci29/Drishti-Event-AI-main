'use server';

import { analyzeCrowdDensity, AnalyzeCrowdDensityInput, AnalyzeCrowdDensityOutput } from '@/ai/flows/analyze-crowd-density';
import { detectAnomalies, DetectAnomaliesInput, DetectAnomaliesOutput } from '@/ai/flows/detect-anomalies';
import { matchFaces, MatchFacesInput, MatchFacesOutput } from '@/ai/flows/match-faces';
import { answerEventQuestions, AnswerEventQuestionsInput, AnswerEventQuestionsOutput } from '@/ai/flows/answer-event-questions';
import { summarizeSafetyRisks, SummarizeSafetyRisksInput, SummarizeSafetyRisksOutput } from '@/ai/flows/summarize-safety-risks';

export async function runAnalyzeCrowdDensity(input: AnalyzeCrowdDensityInput): Promise<AnalyzeCrowdDensityOutput> {
  return await analyzeCrowdDensity(input);
}

export async function runDetectAnomalies(input: DetectAnomaliesInput): Promise<DetectAnomaliesOutput> {
    return await detectAnomalies(input);
}

export async function runMatchFaces(input: MatchFacesInput): Promise<MatchFacesOutput> {
    return await matchFaces(input);
}

export async function runAnswerEventQuestions(input: AnswerEventQuestionsInput): Promise<AnswerEventQuestionsOutput> {
    return await answerEventQuestions(input);
}

export async function runSummarizeSafetyRisks(input: SummarizeSafetyRisksInput): Promise<SummarizeSafetyRisksOutput> {
    return await summarizeSafetyRisks(input);
}
