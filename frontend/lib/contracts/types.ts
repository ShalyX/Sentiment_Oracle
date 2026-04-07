/**
 * TypeScript types for GenLayer Football Betting contract
 */

export interface SentimentResult {
  text: string;
  sentiment: string;
  status: 'PENDING' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'NOT_FOUND' | 'FINALIZED';
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}
