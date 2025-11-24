import Sentiment from 'sentiment';

const sentiment = new Sentiment();

const BLOCKLIST = [
  'kill yourself',
  'kys',
  'rape',
  'slut',
  'whore',
  'bitch',
  'nigger',
  'go die'
];

const WARN_WORDS = [
  'hate',
  'stupid',
  'idiot'
];

export type SafetyAction = 'allow' | 'warn' | 'block';

export interface SafetyResult {
  action: SafetyAction;
  sentimentScore: number;
  triggers: string[];
}

class SafetyService {
  evaluateText(text: string): SafetyResult {
    const lower = text.toLowerCase();
    const triggers: string[] = [];

    for (const w of BLOCKLIST) {
      if (lower.includes(w)) triggers.push(w);
    }
    if (triggers.length > 0) {
      return { action: 'block', sentimentScore: -10, triggers };
    }

    for (const w of WARN_WORDS) {
      if (lower.includes(w)) triggers.push(w);
    }

    const { score } = sentiment.analyze(text);

    if (score < -4) {
      return { action: 'block', sentimentScore: score, triggers: ['negative_sentiment'] };
    }

    if (triggers.length > 0 || score < -1) {
      return { action: 'warn', sentimentScore: score, triggers };
    }

    return { action: 'allow', sentimentScore: score, triggers: [] };
  }
}

export const safetyService = new SafetyService();
