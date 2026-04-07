import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { SentimentResult, TransactionReceipt } from "./types";

/**
 * SentimentOracle contract class for interacting with the GenLayer Sentiment Oracle contract
 */
class SentimentOracle {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    }

    this.client = createClient(config);
  }

  /**
   * Update the address used for transactions
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };

    this.client = createClient(config);
  }

  /**
   * Get all analysis results from the contract
   * @returns Array of sentiment results
   */
  async getAllResults(): Promise<SentimentResult[]> {
    try {
      const results: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_all_results",
        args: [],
      });

      console.log("Raw results from contract:", results);

      // Handle GenLayer Map structure
      if (results instanceof Map) {
        return Array.from(results.entries()).map(([text, sentiment]) => ({
          text: String(text),
          sentiment: String(sentiment),
          status: 'FINALIZED' as const
        }));
      }
      
      // Handle plain object (common for dict returns)
      if (typeof results === 'object' && results !== null) {
        // Sometimes it's { data: { ... } } or similar depending on the wrapper
        const data = results.data || results;
        return Object.entries(data).map(([text, sentiment]) => ({
          text: String(text),
          sentiment: String(sentiment),
          status: 'FINALIZED' as const
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching all results:", error);
      throw new Error("Failed to fetch results from contract");
    }
  }

  /**
   * Get sentiment for a specific text
   * @param text - The text to check
   * @returns The sentiment label
   */
  async getSentiment(text: string): Promise<string> {
    try {
      const sentiment = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_sentiment",
        args: [text],
      });

      return sentiment as string;
    } catch (error) {
      console.error("Error fetching sentiment:", error);
      return "NOT_FOUND";
    }
  }

  /**
   * Submit text for AI sentiment analysis
   * @param text - The text to analyze
   * @returns Transaction receipt
   */
  async analyzeText(text: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "analyze_text",
        args: [text],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30, // Increased retries for AI consensus
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error analyzing text:", error);
      throw new Error("Failed to submit text for analysis");
    }
  }
}

export default SentimentOracle;
