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
    refetchInterval: 3000, // Poll every 3s to reflect consensus updates
    staleTime: 2000,
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

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to analyze text.");
      }
      setIsAnalyzing(true);
      return contract.analyzeText(text);
    },
    onSuccess: async (_, text) => {
      // Small delay to ensure the node has state updated before refetching
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      error("Analysis failed", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isAnalyzing,
    analyzeText: mutation.mutate,
    analyzeTextAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to fetch the sentiment for a specific text
 */
export function useSingleSentiment(text: string | null) {
  const contract = useSentimentOracleContract();

  return useQuery<string, Error>({
    queryKey: ["singleSentiment", text],
    queryFn: () => {
      if (!contract || !text) {
        return Promise.resolve("NOT_FOUND");
      }
      return contract.getSentiment(text);
    },
    enabled: !!contract && !!text,
    staleTime: 0, // Always fetch fresh to avoid caching NOT_FOUND
  });
}
