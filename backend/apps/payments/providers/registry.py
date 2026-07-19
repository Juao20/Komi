from apps.payments.choices import PaymentProvider
from apps.payments.providers.fedapay import FedapayService

_PROVIDERS = {
    PaymentProvider.FEDAPAY: FedapayService,
}


def get_provider(provider_name: str):
    provider_class = _PROVIDERS.get(provider_name)
    if provider_class is None:
        raise ValueError(f"Unknown payment provider: {provider_name}")
    return provider_class()
