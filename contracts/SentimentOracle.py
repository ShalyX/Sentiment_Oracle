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
        prompt = f"""
        Analyze the sentiment of this text: 
        '{text}'
        
        Respond with exactly ONE of these words: POSITIVE, NEGATIVE, or NEUTRAL.
        """
        return gl.nondet.exec_prompt(prompt)

    @gl.public.write
    def analyze_text(self, text: str):
        """
        Write method — costs GEN gas, modifies state.
        Validators reach consensus using the Equivalence Principle.
        """
        # gl.eq_principle.strict_eq wraps the non-deterministic call.
        # Validators must semantically agree before the result is stored.
        sentiment = gl.eq_principle.strict_eq(
            lambda: self._perform_sentiment_analysis(text)
        )
        self.results[text] = sentiment

    @gl.public.view
    def get_sentiment(self, text: str) -> str:
        """
        View method — free to call, reads from state only.
        """
        if text in self.results:
            return self.results[text]
        return "NOT_FOUND"

    @gl.public.view
    def get_all_results(self) -> dict[str, str]:
        """Returns all analyzed texts and their consensus sentiments."""
        return dict(self.results)
