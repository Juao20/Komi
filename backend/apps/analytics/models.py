from django.db import models

from apps.core.models import TimeStampedModel


class AnalyticsSnapshot(TimeStampedModel):
    """Daily rollup per store, populated by a nightly Celery task.

    Kept separate from the live dashboard (apps.analytics.selectors), which
    always computes from raw orders. This snapshot exists so long-range
    historical charts stay fast once a store has years of order history.
    """

    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="analytics_snapshots")
    date = models.DateField()

    orders_count = models.PositiveIntegerField(default=0)
    revenue = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    new_customers_count = models.PositiveIntegerField(default=0)
    visitors_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "analytics_snapshot"
        ordering = ["-date"]
        constraints = [models.UniqueConstraint(fields=["store", "date"], name="unique_snapshot_per_store_per_day")]

    def __str__(self):
        return f"{self.store.name} — {self.date}"
