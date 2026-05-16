# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class SentimentOracle(gl.Contract):
    # Persistent storage for sentiment analysis results
    # maps text -> sentiment_label
    results: TreeMap[str, str]

    def __init__(self):
        self.results = TreeMap[str, str]()


    @gl.public.write
    def analyze_text(self, text: str):
        """
        Triggered when a user wants to analyze text.
        Reaches consensus on the sentiment using the Equivalence Principle.
        """
        # Define the non-deterministic flow as a local function
        # This avoids 'self' access inside the equivalence principle block (E025)
        def get_sentiment():
            prompt = f"Analyze the sentiment of this text: '{text}'. Respond with exactly ONE of these words: POSITIVE, NEGATIVE, or NEUTRAL."
            # 1. Split: Execute non-deterministic LLM call
            raw_output = gl.nondet.exec_prompt(prompt)
            # 2. Normalize: Process in a separate statement
            normalized = raw_output.strip().upper()
            return normalized

        # 3. Reach consensus through the Equivalence Principle
        # This returns the agreed-upon value after validators compare results
        sentiment = gl.eq_principle.strict_eq(get_sentiment)
        
        # 4. Storage: Write to persistent storage outside the EP flow (E026)
        self.results[text] = sentiment

    @gl.public.view
    def get_sentiment(self, text: str) -> str:
        """
        Retrieves the consolidated sentiment for a previously analyzed text.
        """
        if text in self.results:
            return self.results[text]
        return "NOT_FOUND"

    @gl.public.view
    def get_all_results(self) -> dict[str, str]:
        """
        Returns all analyzed text and their sentiments.
        """
        # TreeMap can be returned as a dict to the frontend
        return dict(self.results)
