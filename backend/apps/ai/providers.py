from dataclasses import dataclass


class AIProviderError(Exception):
    """Raised when the LLM provider can't be reached or isn't configured."""


@dataclass
class CompletionResult:
    text: str
    tokens_used: int = 0


class AIProvider:
    """Every LLM integration implements this. apps.ai.services.AIService is the
    only caller — nothing else in the codebase should call a provider directly,
    and the provider itself never touches the database."""

    def complete(
        self, *, system_prompt: str, user_prompt: str, max_tokens: int = 400, temperature: float = 0.4
    ) -> CompletionResult:
        raise NotImplementedError


def get_ai_provider() -> AIProvider:
    from django.conf import settings

    from apps.ai.groq_provider import GroqProvider

    providers = {"groq": GroqProvider}
    # Future: "openai": OpenAIProvider, "anthropic": AnthropicProvider, "gemini": GeminiProvider
    provider_class = providers.get(settings.AI_PROVIDER, GroqProvider)
    return provider_class()
