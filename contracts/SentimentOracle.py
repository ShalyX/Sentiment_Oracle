# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class SentimentOracle(gl.Contract):
    # Persistent on-chain storage: maps text → sentiment label
    results: TreeMap[str, str]

    def __init__(self):
        self.results = TreeMap[str, str]()

    def _perform_sentiment_analysis(self, text: str) -> str:
        """
        ⚠️ Non-deterministic: this calls an LLM.
        Each validator runs this independently.
        """
        # Improved prompt for better consensus reliability
        prompt = f"""
        Analyze the sentiment of the following text objectively.
        Text: '{text}'
        
        Respond only with one of these exact words:
        - POSITIVE
        - NEGATIVE
        - NEUTRAL
        
        Do not include any other text, punctuation, or explanation.
        """
        return gl.nondet.exec_prompt(prompt)

    @gl.public.write
    def analyze_text(self, text: str):
        """
        Write method — costs GEN gas, modifies state.
        Validators reach consensus using the Equivalence Principle.
        """
        # Normalize input text to avoid key mismatches
        clean_text = text.strip()
        
        # gl.eq_principle.strict_eq wraps the non-deterministic call.
        # We strip() and upper() the result to ensure validators agree on the semantic label
        # even if their chosen LLM has slight formatting variations.
        sentiment = gl.eq_principle.strict_eq(
            lambda: self._perform_sentiment_analysis(clean_text).strip().upper()
        )
        
        # Store normalized result
        self.results[clean_text] = sentiment

    @gl.public.view
    def get_sentiment(self, text: str) -> str:
        """
        View method — free to call, reads from state only.
        """
        clean_text = text.strip()
        if clean_text in self.results:
            return self.results[clean_text]
        return "NOT_FOUND"

    @gl.public.view
    def get_all_results(self) -> dict[str, str]:
        """Returns all analyzed texts and their consensus sentiments."""
        return dict(self.results)
