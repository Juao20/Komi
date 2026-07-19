from django.db import models


class ProductStatus(models.TextChoices):
    DRAFT = "draft", "Brouillon"
    ACTIVE = "active", "Active"
    ARCHIVED = "archived", "Archivée"


class ProductReportReason(models.TextChoices):
    COUNTERFEIT = "counterfeit", "Contrefaçon"
    INAPPROPRIATE = "inappropriate", "Contenu inapproprié"
    MISLEADING = "misleading", "Description trompeuse"
    SCAM = "scam", "Arnaque suspectée"
    OTHER = "other", "Autre"


class ProductReportStatus(models.TextChoices):
    PENDING = "pending", "En attente"
    REVIEWED = "reviewed", "Examiné"
    DISMISSED = "dismissed", "Rejeté"
