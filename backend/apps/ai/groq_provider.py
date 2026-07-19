import logging

import requests
from django.conf import settings

from apps.ai.providers import AIProvider, AIProviderError, CompletionResult

logger = logging.getLogger(__name__)


class GroqProvider(AIProvider):
    api_url = "https://api.groq.com/openai/v1/chat/completions"

    def complete(
        self, *, system_prompt: str, user_prompt: str, max_tokens: int = 400, temperature: float = 0.4
    ) -> CompletionResult:
        api_key = settings.GROQ_API_KEY
        if not api_key:
            raise AIProviderError("GROQ_API_KEY is not configured.")

        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                timeout=20,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            logger.error("Groq API error: %s", exc)
            raise AIProviderError("Comy est momentanément indisponible.") from exc

        data = response.json()
        try:
            text = data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError) as exc:
            logger.error("Unexpected Groq response shape: %s", data)
            raise AIProviderError("Réponse inattendue du service IA.") from exc

        tokens_used = data.get("usage", {}).get("total_tokens", 0)
        return CompletionResult(text=text, tokens_used=tokens_used)
