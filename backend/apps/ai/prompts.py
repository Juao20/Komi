import json

COMY_PERSONA = """Tu es Comy, l'assistante IA intégrée à KOMI, une plateforme qui aide les commerçants \
africains à vendre en ligne. Tu es l'employée virtuelle du commerçant : professionnelle, positive, \
bienveillante et proactive. Tu n'es jamais culpabilisante ni intrusive.

Règles strictes :
- Réponds toujours en français, de façon claire et concise (3 à 6 phrases sauf si on te demande plus de détails).
- Utilise UNIQUEMENT les informations fournies dans le CONTEXTE. Ne devine jamais un chiffre, un nom ou une donnée absente du contexte.
- Si une information manque, dis-le simplement plutôt que de l'inventer.
- Tu peux utiliser avec modération quelques emojis parmi : ✨ 🚀 📈 💡 🎉 ⚠️ ✅ (jamais plus de deux par réponse).
- Ne répète pas mécaniquement les chiffres bruts : donne du sens, priorise, conseille."""

BUYER_PERSONA_TEMPLATE = """Tu es Comy, l'assistante d'achat de la boutique "{store_name}" sur KOMI. \
Tu aides les visiteurs à trouver rapidement ce qu'ils cherchent parmi les produits de CETTE boutique uniquement.

Règles strictes :
- Réponds en français, de façon brève et chaleureuse.
- Utilise UNIQUEMENT les produits et informations listés dans le CONTEXTE. N'invente jamais un produit, un prix ou un stock.
- Si aucun produit du contexte ne correspond, dis-le honnêtement et propose de reformuler la recherche.
- Ne révèle jamais d'information autre que ce qui est public (jamais de données internes du commerçant).
- Emojis autorisés avec modération : ✨ 🛍️ 💡 ✅."""


def _json(context: dict) -> str:
    return json.dumps(context, ensure_ascii=False, default=str)


def build_daily_briefing_prompt(context: dict) -> str:
    return (
        "Voici les données du jour pour cette boutique (CONTEXTE JSON) :\n"
        f"{_json(context)}\n\n"
        "Rédige un résumé quotidien chaleureux et actionnable pour le commerçant : "
        "commence par le point le plus important (positif ou à surveiller), puis 1 à 2 conseils concrets. "
        "Pas de liste à puces, un court paragraphe fluide."
    )


def build_health_score_explanation_prompt(context: dict) -> str:
    return (
        "Voici le score de santé de cette boutique et ses composantes (CONTEXTE JSON) :\n"
        f"{_json(context)}\n\n"
        "Explique en 2-3 phrases pourquoi ce score est à ce niveau, puis donne l'action la plus utile "
        "pour l'améliorer. Sois précis et concret, pas générique."
    )


def build_product_analysis_prompt(context: dict) -> str:
    return (
        "Voici les informations d'un produit de la boutique (CONTEXTE JSON) :\n"
        f"{_json(context)}\n\n"
        "Donne 2 à 3 recommandations concrètes pour améliorer les ventes de ce produit "
        "(titre, description, prix, photos, catégorie). Sois spécifique à CE produit, pas générique."
    )


def build_chat_prompt(context: dict, question: str, history: list[dict] | None = None) -> str:
    parts = ["CONTEXTE (données réelles de la boutique, format JSON) :", _json(context)]
    if history:
        parts.append("\nHistorique récent de la conversation :")
        for entry in history:
            parts.append(f"- {entry['role']}: {entry['content']}")
    parts.append(f"\nQuestion du commerçant : {question}")
    parts.append("\nRéponds en te basant uniquement sur le CONTEXTE ci-dessus.")
    return "\n".join(parts)


def build_anomaly_explanation_prompt(context: dict) -> str:
    return (
        "Voici une ou plusieurs anomalies détectées dans les données de cette boutique (CONTEXTE JSON) :\n"
        f"{_json(context)}\n\n"
        "Explique brièvement ce que cela signifie pour le commerçant et ce qu'il devrait vérifier en priorité."
    )


def build_buyer_chat_prompt(context: dict, question: str, history: list[dict] | None = None) -> str:
    parts = ["CONTEXTE (catalogue public de la boutique, format JSON) :", _json(context)]
    if history:
        parts.append("\nHistorique récent de la conversation :")
        for entry in history:
            parts.append(f"- {entry['role']}: {entry['content']}")
    parts.append(f"\nQuestion du client : {question}")
    parts.append("\nRéponds en te basant uniquement sur le CONTEXTE ci-dessus.")
    return "\n".join(parts)
