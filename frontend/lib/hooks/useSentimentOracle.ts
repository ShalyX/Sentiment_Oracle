"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import SentimentOracle from "../contracts/SentimentOracle";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { SentimentResult } from "../contracts/types";

/**
 * Hook to get the SentimentOracle contract instance
 */
export function useSentimentOracleContract(): SentimentOracle | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.",
      );
      return null;
    }

    return new SentimentOracle(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

/**
 * Hook to fetch all sentiment analysis results
 */
export function useSentimentResults() {
  const contract = useSentimentOracleContract();

  return useQuery<SentimentResult[], Error>({
    queryKey: ["sentimentResults"],
    queryFn: () => {
      if (!contract) {
        return Promise.resolve([]);
      }
      return contract.getAllResults();
    },
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Poll every 5s to reflect consensus updates
    staleTime: 3000,
    enabled: !!contract,
  });
}

/**
 * Hook to submit text for sentiment analysis
 */
export function useAnalyzeText() {
  const contract = useSentimentOracleContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedSentiment, setExtractedSentiment] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to analyze text.");
      }
      setIsAnalyzing(true);
      setExtractedSentiment(null); // Reset
      
      const receipt = await contract.analyzeText(text);
      if (receipt.consensusResult) {
        setExtractedSentiment(receipt.consensusResult);
      }
      return receipt;
    },
    onSuccess: async (_, text) => {
      // Longer delay for GenLayer state finalization
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Invalidate both global and specific queries
      queryClient.invalidateQueries({ queryKey: ["sentimentResults"] });
      queryClient.invalidateQueries({ queryKey: ["singleSentiment", text] });
      
      setIsAnalyzing(false);
      success("Analysis complete!", {
        description: "The sentiment has been recorded on the blockchain."
      });
    },
    onError: (err: any) => {
      console.error("Error analyzing text:", err);
      setIsAnalyzing(false);
      setExtractedSentiment(null);
      error("Analysis failed", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isAnalyzing,
    extractedSentiment,
    analyzeText: mutation.mutate,
    analyzeTextAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to fetch the sentiment for a specific text
 */
export function useSingleSentiment(text: string | null) {
  const contract = useSentimentOracleContract();
  const { data: allResults } = useSentimentResults();

  return useQuery<string, Error>({
    queryKey: ["singleSentiment", text],
    queryFn: async () => {
      if (!contract || !text) {
        return "NOT_FOUND";
      }

      // 1. Try direct contract call
      const directResult = await contract.getSentiment(text);
      if (directResult && directResult !== "NOT_FOUND") {
        return directResult;
      }

      // 2. Fallback: Search the global results list for a normalized match
      // This solves the key mismatch issue (e.g. whitespace/newlines) without redeploying
      if (allResults && allResults.length > 0) {
        const normalizedInput = text.trim().toLowerCase();
        const match = allResults.find(r => 
          r.text.trim().toLowerCase() === normalizedInput
        );
        
        if (match) {
          console.log("Found match in global results fallback:", match.sentiment);
          return match.sentiment;
        }
      }

      return "NOT_FOUND";
    },
    enabled: !!contract && !!text,
    staleTime: 0,
    refetchInterval: (query) => {
      // Keep polling if not found or if the result is NOT_FOUND
      return (query.state.data === "NOT_FOUND" || !query.state.data) ? 3000 : false;
    }
  });
}
