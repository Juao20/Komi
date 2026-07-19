from django.db import models


class StoreSector(models.TextChoices):
    CLOTHING = "clothing", "Vêtements"
    SHOES = "shoes", "Chaussures"
    COSMETICS = "cosmetics", "Cosmétiques"
    PERFUMES = "perfumes", "Parfums"
    PHONES = "phones", "Téléphones"
    ACCESSORIES = "accessories", "Accessoires"
    RESTAURANT = "restaurant", "Restaurant"
    PASTRY = "pastry", "Pâtisserie"
    ELECTRONICS = "electronics", "Électronique"
    BEAUTY = "beauty", "Beauté"
    SERVICES = "services", "Services"
    CRAFTS = "crafts", "Artisanat"
    OTHER = "other", "Autre"


class StoreStatus(models.TextChoices):
    DRAFT = "draft", "Brouillon"
    PUBLISHED = "published", "Publiée"
    SUSPENDED = "suspended", "Suspendue"


class StorePlan(models.TextChoices):
    FREE = "free", "Free"
    STARTER = "starter", "Starter"
    PRO = "pro", "Pro"


PLAN_PRODUCT_LIMITS = {
    StorePlan.FREE: 20,
    StorePlan.STARTER: None,
    StorePlan.PRO: None,
}

CURRENCY_CHOICES = [
    ("XOF", "Franc CFA (XOF)"),
    ("XAF", "Franc CFA (XAF)"),
    ("NGN", "Naira (NGN)"),
    ("GHS", "Cedi (GHS)"),
    ("KES", "Shilling (KES)"),
    ("ZAR", "Rand (ZAR)"),
    ("MAD", "Dirham (MAD)"),
    ("EGP", "Livre égyptienne (EGP)"),
    ("USD", "Dollar (USD)"),
    ("EUR", "Euro (EUR)"),
]

COUNTRY_CHOICES = [
    ("CI", "Côte d'Ivoire"),
    ("SN", "Sénégal"),
    ("CM", "Cameroun"),
    ("NG", "Nigeria"),
    ("GH", "Ghana"),
    ("BJ", "Bénin"),
    ("TG", "Togo"),
    ("ML", "Mali"),
    ("BF", "Burkina Faso"),
    ("CD", "RD Congo"),
    ("CG", "Congo"),
    ("GA", "Gabon"),
    ("KE", "Kenya"),
    ("ZA", "Afrique du Sud"),
    ("MA", "Maroc"),
    ("EG", "Égypte"),
    ("OTHER", "Autre"),
]
